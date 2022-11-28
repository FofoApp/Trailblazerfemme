const fs = require('fs');
require('dotenv').config();
var request = require('request');
const createError = require('http-errors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const { cloudinary } = require('./../helpers/cloudinary');
const sdk = require('api')('@sendchamp/v1.0#1v843jkyvjm1me');


const { registerValidation, 
    loginValidation, 
    resetPasswordSchema, 
    passwordOnlySchema, 
    otpValidation
} = require('../validations/userValidationSchema');
const User = require('./../models/UserModel');
const Otpmodel = require('../models/OtpModel');
const RefreshAccessToken = require('./../models/RefreshAccessTokenModel');

const FollowersAndFollowingModel = require('./../models/FollowersAndFollowingModel');

const { signInAccessToken, signInRefreshToken, verifyRefreshToken, resetPasswordToken } = require('./../helpers/jwtHelper');

const { generateFourDigitsOTP } = require('./../helpers/otpGenerator');
const { sendGridMail } = require('./../helpers/sendGridMessaging');

const {sendSMS} = require('./../helpers/twilioSMS');
const { calculateNextPayment }  = require('./../helpers/billing');
const runCron = require('../runCron')
const moment = require('moment');
const Membership = require('../models/adminModel/AdminMembershipModel');
const MembershipSubscriber = require('../models/membershipModel/MembershipSubscribersModel');
runCron();
exports.register = async (req, res, next) => {
    //POST REQUEST
    //http://localhost:2000/api/auth/register
    /**
     * {   "fullname": "Olawumi Olusegun",
            "email": "ade@gmail.com",
            "phonenumber": "+2347065066382",
            "field": "Freemium",
            "roles": "admin",
            "password": "password123"
        }

     */


    const annually = 'years';
    const monthly = 'months';
    const days = 'days';
   
    
    try {

        // if(!email || !password) throw createError.BadRequest();

        const result = await registerValidation(req.body);

        const doesExist = await User.findOne({ fullname: result?.fullname, email: result?.email });

        if(doesExist?.fullname === result?.fullname || doesExist?.email === result?.email && doesExist.accountVerified === false) {

            const otpCode = generateFourDigitsOTP();

            const otpExist = await Otpmodel.deleteOne({ userId: doesExist._id });
    
            const newOtp = await Otpmodel.create({ userId: doesExist.id, phonenumber: doesExist.phonenumber, otp: otpCode });

            const { _id: id, email, roles, fullname: username, field } = doesExist;

            const userObject = {  id, email, roles, username, field };

            if(doesExist.profileImagePath) {
                userObject.profileImagePath = doesExist.profileImagePath
            }
              
            const accessToken = signInAccessToken(userObject);

            const refreshToken = signInRefreshToken(userObject);
    
            let refreshAccessToken = await RefreshAccessToken.findOne({ userId: doesExist.id });
            
            if(refreshAccessToken) {
                await refreshAccessToken.remove();
            }


            // return res.json({ accessToken })
    
            refreshAccessToken = new RefreshAccessToken({ userId: doesExist.id,  accessToken, refreshToken});
            
            await refreshAccessToken.save();
    
            return res.status(200).send({ accessToken, refreshToken, userId: doesExist.id, stage: 1, otp: otpCode,  message: "Otp has been sent to your phone"});
    

            // return res.status(400).json({ error: "A user with name and/or email already exist"})
        }


        // const otpUserExist = await Otpmodel.findOne({ userId: doesExist.id });

        const date = calculateNextPayment(annually, moment().format());
        
        if(doesExist) throw createError.Conflict(`${result.email} already exist`);
       
        const user = new User({...result,  nextPaymentDate: date});

        // const follow = await FollowersAndFollowingModel.create({userId: user._id});
        
        const savedUser = await user.save();

        const otpCode = generateFourDigitsOTP();

        // const otp = sendSMS(otpCode);
        // const sentSms  = sendGridMail(user.email, otpCode);

        let smsError;
        let smsRes;

            var options = {
                'method': 'POST',
                'url': `${process.env.SENDCHAMP_BASE_URL}`,
                'headers': {
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${process.env.SENDCHAMP_PUBLIC_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "to":[`${savedUser.phonenumber}`],
                    "message": `Your otp code is ${otpCode}`,
                    "sender_name":"Sendchamp",
                    "route":"international"
                })
              
              }


            //   request(options, async function (error, response) {

            //     if (error) throw new Error(error);

            //     const otpIsSet = await Otpmodel.findByIdAndDelete(savedUser._id);
        
            //     const newOtp = await Otpmodel.create({ userId: savedUser.id, phonenumber: savedUser.phonenumber, otp: otpCode });
            //   });

        const saveOTP = await Otpmodel.create({ otp: otpCode, userId: savedUser.id, phonenumber: savedUser.phonenumber});

        if(!saveOTP)return res.status(400).json({ message: "Unable to send otp code"})

        const {id, email, roles, username, field, profileImagePath } = savedUser;

        const userObject = {  id, email, roles, username, field, profileImagePath };
          
        const accessToken = await signInAccessToken(userObject);

        const refreshToken = await signInRefreshToken(userObject);

        let refreshAccessToken = await RefreshAccessToken.findOne({ userId: savedUser.id });
        
        if(refreshAccessToken) {
            await refreshAccessToken.remove();
        }

        refreshAccessToken = new RefreshAccessToken({ userId: savedUser.id,  accessToken, refreshToken});
        
        await refreshAccessToken.save();

        return res.status(200).send({accessToken, refreshToken, userId: savedUser.id, stage: 1, otp: otpCode,  message: "Otp has been sent to your phone"});

       
    } catch (error) {
        console.log(error)
        if(error.isJoi === true) {
            //unprocessible entry errors: server can't understand or process the entries
            error.status = 422;
        }
        next(error)
    }
    
}


exports.login = async (req, res, next) => {
    // taskScheduler.start()

    //POST REQUEST
    //http://localhost:2000/api/auth/login
    /**
     * {
            "email": "ade@gmail.com",
            "password": "password123"
        }
     */
    
    try {

        const result = await loginValidation(req.body);
        
        const user = await User.findOne({ email: result.email }).populate("membershipSubscriberId", "isActive membershipId amount membershipType createdAt");
        
        if(!user) {
            throw createError.NotFound("User not registered");
        }

        // if(!user.membershipSubscriberId) {
        //     throw createError.Unauthorized("You are not subscribed yet");
        // }

        // if(!user.subscriptionId) {
        //     throw createError.Unauthorized("You are not subscribed yet");
        // }

        let membership_details = {
            subscriptionId: user?.subscriptionId,
             paid: user?.paid, 
             membershipType: user?.membershipType, 
             isActive: user?.isActive, 
             amount: user?.amount,
        }
    
        const isMatch = await user.isValidPassword(result.password);
        
        if(!isMatch) {
            throw createError.Unauthorized('Username/password not valid'); 
        }

        const accessToken =  signInAccessToken(user);
        const refreshToken = signInRefreshToken(user);

        //if Refresh tokenn is set
        const isRefreshTokenSet = await RefreshAccessToken.findOne({userId: user.id});
       
        if(isRefreshTokenSet) {
            isRefreshTokenSet.remove();
        }
        
        const refreshAccessToken = new RefreshAccessToken(
            {
            userId: user.id,
            accessToken:accessToken,
            refreshToken:refreshToken
            });

        const savedRefreshAccessToken = await refreshAccessToken.save();
        
        return res.status(200).send({accessToken, refreshToken });

    } catch (error) {
        if(error.isJoi === true) {           
            return res.status(401).send({ message: error.message})
        }
        next(error);
    }
}


exports.refreshToken = async (req, res, next) => {
    
    try {
        const {refreshToken} = req.body;
        if(!refreshToken) {
            throw createError.BadRequest();
        }
        const userId = await verifyRefreshToken(refreshToken);
        const accessToken = signInAccessToken(userId);
        const refToken = signInRefreshToken(userId);
        return res.send({ accessToken: accessToken, refreshToken: refToken });
    } catch (error) {
        next(error);
    }
}

exports.logout = async (req, res, next) => {
    //DELETE REQUEST
    //http://localhost:2000/api/auth/delete-user/userId
    //http://localhost:2000/api/auth/delete-user/627fbadbc81d6b5315941f67

    try {
        const  refreshToken = req.headers.authorization.split(" ")[1];
      
        if(!refreshToken) {
            throw createError.BadRequest();
        }

        const userId = await verifyRefreshToken(refreshToken);
               
        //if Refresh tokenn is set
        const isRefreshTokenSet = await RefreshAccessToken.findOne({userId: userId});
       
        if(!isRefreshTokenSet) {
            return res.status(404).send({ message: "Unable to logout user"})
        }

        await RefreshAccessToken.findByIdAndDelete({userId: userId});

        return res.status(404).send({ message: "You are now logged out"})


    } catch (error) {
        // console.log(error)
        next(error);
    }
}


// ///ADMIN DASHBOARD LAYOUT
// exports.dashboardListUsers = async (req, res, next) => {
//     //DASHBOARD USER
//     //GET REQUEST
//     //http://localhost:2000/api/auth/dashboard-list-users
//     try {
//         const adminArray = [];
//         const paidArray = [];

//         const users = await User.find({}).select(`-password -__v -updatedAt -following -followers -recentlySearchedBook 
//         -recentlyPlayedPodcast -booksRead -library `).limit(5);
        
//         users.map((user) => {
//             if(user.roles[0] === 'admin') adminArray.push(user.roles[0]);

//             if(user.isPaid) paidArray.push(user.isPaid);
//         });

//         const adminData = {
//             userCounts: users.length,
//             adminCounts: adminArray.length,
//             paidUserCounts: paidArray.length,
//             userLists: users
//         }

//         return res.status(200).send(adminData)
        
//     } catch (error) {
//         return res.status(500).send({ message: error.message });
//     }
// }

// exports.memberShip = async (req, res, next) => {
//     //DASHBOARD MEMBERSHIP
//     //GET REQUEST
//     //http://localhost:2000/api/auth/dashboard-membership

//     try {

//         const goldPlan = [];
//         const silverPlan = [];

//         const users = await User.find({}).select(`-password -__v -updatedAt -following -followers -recentlySearchedBook 
//         -recentlyPlayedPodcast -booksRead -library `).limit(5);

//         const membership2 = await User.find({});

//         membership2.map((member) => {

//             if(member.membershipPlan === "goldPlan") {
//                 goldPlan.push(member.membershipPlan);
//             }

//             if(member.membershipPlan === "silverPlan") {
//                 silverPlan.push(member.membershipPlan);
//             }

//         });

//         const adminData = {
//             goldMemberCounts: goldPlan.length,
//             silverMemberCount: silverPlan.length,
//             totalMembershipCount: membership2.length,
//             membershipRevenue: '',
//             users
//         }

//         return res.status(200).send(adminData);

//     } catch (error) {
//         return res.status(500).send({ message: error.message });
//     }
// }

exports.updateUser = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/auth/user/:userId/update
    //http://localhost:2000/api/auth/user/62902e117ecadf9305054e1a/update
    const userId = req.user.id;

    try {

        let user  = await User.findById(req.user.aud).select('-socialLinks -isPaid');
    
        if(!user) throw createError.Conflict(`User with ${user.email} does not exist`);

        let userData = {...req.body, roles: "user"};
        
        // const result = registerSchema(user, true);
        const result = registerValidation(userData, true);

        if(!result) {
            return res.status(200).send({message: 'Unable to update user'});
        }

        const updatedUser =    await User.findByIdAndUpdate(userId, result, { new: true });

    return res.status(200).send({message: 'Updated successfully'});

    } catch (error) {
        // return res.status(401).send(error)
        next(error);
    }
       
}

exports.uploadProfilePicture = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/auth/upload-profile-picture/:userId/upload
    //http://localhost:2000/api/auth/upload-profile-picture/62902e117ecadf9305054e1a/upload


    let currentUser = req.user.id;

    try {
        let user  = await User.findById(currentUser).select('-socialLinks -isPaid -password');
   
        if(!user) throw createError.Conflict(`User with ${user.email} does not exist`);

        // const result = registerSchema(profilePic, true);

        // if(!result) {
        //     return res.status(200).send({message: 'Unprocessible image'});
        // }
        
        // //Upload Image to cloudinary
        const uploaderResponse = await cloudinary.uploader.upload(req.file.path);

        if(!uploaderResponse) {
            //Reject if unable to upload image
            return res.status(404).send({ message: "Unable to upload image please try again"});
        }

        const updatedProfileImage = await User.updateOne({_id:currentUser}, {$set: 
            { 
                profileImageCloudinaryPublicId: uploaderResponse.public_id,  
                profileImage: uploaderResponse.secure_url
            }
        
        }, { new: true });

        if(updatedProfileImage) {

            fs.unlinkSync(req.file.path);

            return res.status(200).send({message: 'Profile Image Updated successfully', stage: 3 });
        }

   

    } catch (error) {
        // return res.status(401).send(error)
        next(error);
    }
       
}



exports.deleteUser = async (req, res, next) => {
    //DELETE REQUEST
    //http://localhost:2000/api/auth/user/:userId/delete
    //http://localhost:2000/api/auth/user/62902e117ecadf9305054e1a/delete

    try {
        const result = await User.findOne({ _id: req.params.userId });

        if(!result) throw createError.Conflict(`User does not exist`);
      
        let uploaderResponse = await cloudinary.uploader.destroy(result.profileImageCloudinaryPublicId);

        if(!uploaderResponse) {
            return res.status(400).send({ message: "Unable to delete user"});
        }
    
        const deletedUser = await User.findByIdAndDelete(result.id);
      
        if(!deletedUser) {
            return res.status(401).send({ message: 'Unable to delete user'});
        }

        return res.status(200).send({ message: 'User deleted successfully'});

    } catch (error) {
        next(error)
    }
}



exports.resetPassword = async (req, res, next) => {

    const { email } = req.body;

    try {

        const result = await resetPasswordSchema.validateAsync({email});

        const doesExist = await User.findOne({ email: result.email });

        if(!doesExist) throw createError.Conflict(`${result.email} does not exist`);

        const resetToken = await resetPasswordToken(doesExist);
        
        const sendPage = `https://fofoapp.herokuapp.com/api/auth/reset-password/${doesExist._id}/${resetToken}`;
        
        // SEND sendPage to email address
        //
        return res.status(200).send({ sendPage: sendPage, resetToken: resetToken });

    } catch (error) {
        return res.status(200).send(error)
    }
}

exports.getResetPasswordToken = async (req, res, next) => {
    const { id, token } = req.params;
    try {
        if(!id && !token) {
            return res.status(401).send({message: "User not verified"})
        }
        const doesExist = await User.findOne({ _id: id }).select('password -_id').lean();
       
        if(!doesExist) throw createError.Conflict(`User does not exist`);

        // const result = await resetPasswordSchema.validateAsync(req.body);

        const secret =  process.env.RESET_PASSWORD_SECRET_KEY + doesExist.password;

        const payload  = JWT.verify(token, secret);
        
        if(!payload) {
            return res.status(401).send({ message: 'Unable to verify user'});
        }
        //SEND OTP TO USER PHONE
        // Object.assign(doesExist, req.body);
        // doesExist.save();
        // console.log("user", doesExist)
        // const updatedUser =    await User.findByIdAndUpdate(id, dataToUpdate, { new: true });
        return res.status(200).send({message: 'User verified'})

    } catch (error) {
        return res.status(200).send(error)
    }
}

exports.postResetPasswordToken = async (req, res, next) => {
    const { id, token } = req.params;
    const { password, confirmPassword } = req.body;

    if(password !== confirmPassword) {
        return res.status(401).send({ error: 'Password mis-match'});
    }

    try {
        let doesExist = await User.findOne({ _id: id }).select('password -_id');

        if(!doesExist) throw createError.Conflict(`User does not exist`);
        
        const { value: result } = await passwordOnlySchema({password, confirmPassword});

        const secret =  process.env.RESET_PASSWORD_SECRET_KEY + doesExist.password;

        const payload  = JWT.verify(token, secret);
        
        if(!payload) {
            return res.status(401).send({ message: 'Unable to verify user'});
        }
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        doesExist.password = hashedPassword;

        await User.findByIdAndUpdate(id, {$set: doesExist}, { new: true });
        
        return res.status(200).send({message: 'User Password successfully updated'})

    } catch (error) {

        if(error.details) {
            return res.status(401).send({error: error.details[0].message});
        }

        return res.status(401).send(error)
    }
}

exports.updatePassword = async (req, res, next) => {

    const userId = req.params.userId;
    const { password, confirmPassword } = req.body;
    try {

        if(password !== confirmPassword) {
            return res.status(401).send({ error: 'Password mis-match'});
        }

        if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(401).send({ error: 'Invalid user id'});

        const user = await User.findOne({_id: userId});
        
        if(!user) return res.status(404).send({error: "User not found"});

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        const updatePassword = await User.findByIdAndUpdate(user.id, {$set: { password: hashedPassword }});
        
        // const accessToken = await signInAccessToken(user);
        // const refreshToken = await signInRefreshToken(user);

        // //if Refresh tokenn is set
        // const isRefreshTokenSet = await RefreshAccessToken.findOne({userId: user.id});
       
        // if(isRefreshTokenSet) isRefreshTokenSet.remove();

        // const refreshAccessToken = new RefreshAccessToken({
        //     userId: user.id,
        //     accessToken:accessToken,
        //     refreshToken:refreshToken
        // });

        // const savedRefreshAccessToken = await refreshAccessToken.save();

        if(!updatePassword) return res.status(400).send({error: "Unable to update password"});

        return res.status(200).send("Password updated successfully");

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

exports.otpPage = async (req, res, next) => {

    const { email } = req.body;

    try {

        const user = await User.findOne({ email: email });

        if(!user) return res.status(404).send({ error: "User not found" });
        
        const otpCode = generateFourDigitsOTP();

        // const otp = sendSMS(otpCode);
        // const sentSms  = sendGridMail(user.email, otpCode);

        // sdk['https://api.sendchamp.com/api/v1']({
        //     to: ['+2347065066382'],
        //     message: `Your otp code is ${otp}`,
        //     sender_name: `${savedUser.name}`,
        //     route: 'international'
        //   }, {Authorization: 'Bearer null'})
        //     .then(res => console.log(res))
        //     .catch(err => console.error(err));

        // if(!sentSms) {
        //     if(!otp) res.status(500).send({message: "Unable to send otp code via mail"});
        // }

        // if(!otp) res.status(500).send({message: "Unable to send otp"});

        // console.log("otp:", otp)

        const { id, phonenumber } = user;

        const otpExist = await Otpmodel.deleteOne({ userId: id });

        const newOtp = await Otpmodel.create({ userId: id, phonenumber, otp: otpCode });

        const userData = { userId: newOtp.userId, otp: newOtp.otp,  };

        return res.status(200).send(userData);

    } catch (error) {
        return res.status(401).send({ error: error.message });
    }
    
}


exports.verifyOtp = async (req, res, next) => {
    
    try {


        const { otp } = req.body;

        if(otp.length < 4 || otp.length > 4 ) return res.status(200).send({ error: 'Input valid 4 digit otp code'})
        
        const isOtpFound = await Otpmodel.findOne({ otp: otp })

        if(!isOtpFound) {
            return res.status(404).send({ error: 'OTP not found'})
        }

        const user = await User.findOne({_id: isOtpFound.userId})

        if(!user) return res.status(400).send({ error: "Unprocessible OTP ", stage: 1 });
        
        const verified = await User.findByIdAndUpdate(isOtpFound.userId, { $set: { accountVerified: true }}, { new: true});
       
        if(verified) {
            await Otpmodel.findByIdAndDelete(isOtpFound.id)
            
        }
        return res.status(200).send({ message: "Otp verified", stage: 2 });

    } catch (error) {
        
        next(error)
    }
    
}


