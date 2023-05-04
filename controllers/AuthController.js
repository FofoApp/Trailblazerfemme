const fs = require('fs');
require('dotenv').config();
var request = require('request');
const createError = require('http-errors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const { cloudinary } = require('./../helpers/cloudinary');
const sdk = require('api')('@sendchamp/v1.0#1v843jkyvjm1me');
const { sendMail } =  require('./../helpers/sendMail')

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

const { sendSMS } = require('./../helpers/twilioSMS');
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

        const userExist = await User.findOne({ email: result?.email });

        if(userExist?.email === result?.email && !userExist?.accountVerified) {

            const otpCode = generateFourDigitsOTP();

            const otpExist = await Otpmodel.deleteOne({ userId: userExist?._id });
    
            const newOtp = await Otpmodel.create({ userId: userExist?.id, phonenumber: userExist?.phonenumber, otp: otpCode });

            const { _id: id, email, roles, fullname: username, field } = userExist;

            const userObject = {  id, email, roles, username, field };

            if(userExist?.profileImagePath) {
                userObject.profileImagePath = userExist?.profileImagePath
            }
              
            const accessToken = signInAccessToken(userObject);

            const refreshToken = signInRefreshToken(userObject);
    
            let refreshAccessToken = await RefreshAccessToken.findOne({ userId: userExist?.id });
            
            if(refreshAccessToken) {
                await refreshAccessToken.remove();
            }

            refreshAccessToken = new RefreshAccessToken({ userId: userExist?.id,  accessToken, refreshToken});

            const sentMail  = await sendMail(email, otpCode);          
         
            await refreshAccessToken.save();
    
             res.status(200).json({ accessToken, refreshToken, userId: userExist?.id, stage: 1, otp: otpCode,  message: "Otp has been sent to your email"});
             return
        }


        // const otpUserExist = await Otpmodel.findOne({ userId: userExist?.id });

        const nextPaymentDate = calculateNextPayment(annually, moment().format());

        if(userExist?.email === result?.email && userExist?.accountVerified) {

            const { _id: id, email, roles, fullname: username, field } = userExist;

            const userObject = {  id, email, roles, username, field };

            const accessToken = signInAccessToken(userObject);

            const refreshToken = signInRefreshToken(userObject);
    
            let refreshAccessToken = await RefreshAccessToken.findOne({ userId: userExist?.id });
            
            if(refreshAccessToken) await refreshAccessToken.remove();
    
            refreshAccessToken = new RefreshAccessToken({ userId: userExist?.id,  accessToken, refreshToken});
            
            await refreshAccessToken.save();

             const userdata = {
                success: true,
                message: `${result.email} is a verified user, proceed to membership`,
                stage: 2,
                accessToken,
                refreshToken,
                userId: userExist?.id
            }

            return res.status(200).json(userdata);
        }
       
        const user = new User({...result,  nextPaymentDate });

        // const follow = await FollowersAndFollowingModel.create({userId: user._id});
        
        const savedUser = await user.save();

        const otpCode = generateFourDigitsOTP();

        // const otp = sendSMS(otpCode);
        // const sentSms  = sendGridMail(user.email, otpCode);

        // let smsError;
        // let smsRes;

        //     var options = {
        //         'method': 'POST',
        //         'url': `${process.env.SENDCHAMP_BASE_URL}`,
        //         'headers': {
        //           'Accept': 'application/json',
        //           'Authorization': `Bearer ${process.env.SENDCHAMP_PUBLIC_KEY}`,
        //           'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify({
        //             "to":[`${savedUser.phonenumber}`],
        //             "message": `Your otp code is ${otpCode}`,
        //             "sender_name":"Sendchamp",
        //             "route":"international"
        //         })
              
        //       }

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

        refreshAccessToken = new RefreshAccessToken({ userId: savedUser?.id,  accessToken, refreshToken });
       
        await sendMail(email, otpCode, res)

        await refreshAccessToken.save();

        return res.status(200).send({accessToken, refreshToken, userId: savedUser?.id, stage: 1, otp: otpCode,  message: "Otp has been sent to your phone"});

       
    } catch (error) {
        if(error.isJoi === true) {
            //unprocessible entry errors: server can't understand or process the entries
            return res.status(422).json({ error: "validation error"})
        }
        // NODEMAILER ERROR MESSAGE
        if(error?.code === "EAUTH") {
            return res.status(500).json({ error: "Unable to send email"})
        }
        return res.status(500).json({ error: error?.message })
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
        
        const user = await User.findOne({ email: result?.email }).populate("membershipSubscriberId", "isActive membershipId amount membershipType createdAt");
        
        if(!user) {
            return res.status(404).json({ status: "failed", message: "User not registered" });
        }

        if(!user?.accountVerified) {
            const msg = "Your account is not yet verified";
             res.status(400).json({ status: "failed", error: msg, message: msg })
             return
        }

        // Check if password is correct
        const isMatch = await user.isValidPassword(result?.password);

        if(!isMatch) {
            throw createError.Unauthorized('Username/password not valid'); 
        }

        let membership_details = {
            // subscriptionId: user?.subscriptionId,
             paid: user?.paid,
             membershipType: user?.membershipType, 
             isActive: user?.isActive, 
            //  amount: user?.amount,
        }
    

        const accessToken =  signInAccessToken(user);
        const refreshToken = signInRefreshToken(user);

        //if Refresh tokenn is set
        const isRefreshTokenSet = await RefreshAccessToken.findOne({userId: user?.id});
       
        if(isRefreshTokenSet) {
            isRefreshTokenSet.remove();
        }
        
        const refreshAccessToken = new RefreshAccessToken(
            {
            userId: user?.id,
            accessToken:accessToken,
            refreshToken:refreshToken
            });

        const savedRefreshAccessToken = await refreshAccessToken.save();
        
        return res.status(200).send({ 
            accessToken, 
            refreshToken, 
            membership_details,

            fullname: user?.fullname,
            phonenumber: user?.phonenumber,
            role: user?.roles[0],

            // email: user.email,
            // field: user.field,
            // city:  user.cityState
        });

    } catch (error) {
        if(error.isJoi === true) {      
            const msg = "Invalid parameters"     
            return res.status(422).send({ status:"failed", error: msg, message: msg})
        }

        return res.status(500).send({ status:"failed", error: error?.message, message: error?.message,})
    }
}


exports.refreshToken = async (req, res, next) => {
    
    try {
        const { refreshToken } = req.body;

        if(!refreshToken) {
            return res.status(400).send({ status:"failed", message: 'Invalid token'})
        }

        const userId = await verifyRefreshToken(refreshToken);
        const accessToken = signInAccessToken(userId);
        const refToken = signInRefreshToken(userId);

        return res.status(200).json({ status:"success", accessToken: accessToken, refreshToken: refToken });

    } catch (error) {
        return res.status(500).send({ status:"failed", error: error?.message, message: error?.message,})
    }
}

exports.logout = async (req, res, next) => {
    //DELETE REQUEST
    //http://localhost:2000/api/auth/delete-user/userId
    //http://localhost:2000/api/auth/delete-user/627fbadbc81d6b5315941f67

    try {
        const  refreshToken = req.headers.authorization.split(" ")[1];
      
        if(!refreshToken) {
            return res.status(400).send({ status:"failed", message: "Invalid token"})
        }

        const userId = await verifyRefreshToken(refreshToken);
               
        //if Refresh tokenn is set
        const isRefreshTokenSet = await RefreshAccessToken.findOne({ userId: userId });
       
        if(!isRefreshTokenSet) {
            return res.status(404).send({ status:"failed", message: "Unable to logout user"})
        }

        await RefreshAccessToken.findByIdAndDelete({userId: userId});

        return res.status(404).send({ status:"failed", message: "You are now logged out"})


    } catch (error) {
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

        let user  = await User.findById(req?.user?.aud).select('-socialLinks -isPaid');
    
        if(!user) {
            return res.status(400).json({status: "failed", message:`User with ${user?.email} does not exist`});
        }

        let userData = { ...req.body };
        
        const result = await registerValidation(userData, true);

        if(!result) {
            return res.status(200).send({status: "failed", message: 'Unable to update user'});
        }

        if(req?.file) {
 
        // Check if user already has a profile image
        if(user?.profileImageCloudinaryPublicId && user?.profileImage) {
            // Delete user profile image from cloudinary
            let deleteResponse = await cloudinary.uploader.destroy(user?.profileImageCloudinaryPublicId);        
        
            if(!deleteResponse) {
                //Reject if unable to upload image
                return res.status(400).json({ message: "Unable to delete profile image please try again"});
            }

        }

        // //Upload Image to cloudinary
        const { public_id, secure_url } = await cloudinary.uploader.upload(req?.file?.path);

        if(!secure_url && !public_id) {
            //Reject if unable to upload image
            return res.status(404).json({status: "failed", message: "Unable to upload image please try again"});
        }

        result["profileImageCloudinaryPublicId"] = public_id;
        result["profileImage"] = secure_url;

        fs.unlinkSync(req?.file?.path);

        }

        // Delete password from th object that password field does not update
        delete result?.password;

        //update user details
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: result }, { new: true });

        if(!updatedUser) {
            return res.status(400).json({status: "failed", message: 'Unable to update user info'});
        }

        return res.status(200).json({status: "success", message: 'Updated successfully'});

    } catch (error) {
        next(error);
    }
       
}

exports.uploadProfilePicture = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/auth/upload-profile-picture/:userId/upload
    //http://localhost:2000/api/auth/upload-profile-picture/62902e117ecadf9305054e1a/upload


    let currentUser = req?.user?.id;

    try {
        let user  = await User.findById(currentUser).select('-socialLinks -isPaid -password');
   
        if(!user) throw createError.Conflict(`User with ${user?.email} does not exist`);
        
        // //Upload Image to cloudinary
        const { public_id, secure_url} = await cloudinary.uploader.upload(req?.file?.path);

        fs.unlinkSync(req?.file?.path);

        if(!secure_url && !public_id) {
            //Reject if unable to upload image
            return res.status(404).json({status: "failed", message: "Unable to upload image please try again"});
        }

        const updatedProfileImage = await User.updateOne({_id: currentUser}, 
            { $set: 
            {
                profileImageCloudinaryPublicId: public_id,  
                profileImage: secure_url
            }
        
        }, { new: true });

        if(!updatedProfileImage) {
            return res.status(400).json({status: "failed", message: 'Unable to update profile image', stage: 3 });
        }

        return res.status(200).json({status: "success", message: 'Profile Image Updated successfully', stage: 3 });

    } catch (error) {
        // return res.status(401).json(error)
        next(error);
    }
       
}



exports.deleteUser = async (req, res, next) => {
    //DELETE REQUEST
    //http://localhost:2000/api/auth/user/:userId/delete
    //http://localhost:2000/api/auth/user/62902e117ecadf9305054e1a/delete

    try {
        const userExist = await User.findOne({ _id: req.params.userId });

        if(!userExist) return res.status(404).json({status: "failed", message: `User does not exist`});
      
        let uploaderResponse = await cloudinary.uploader.destroy(userExist?.profileImageCloudinaryPublicId);

        if(!uploaderResponse) {
            return res.status(400).json({status: "failed", message: "Unable to delete user profile image, please try again"});
        }
    
        const deletedUser = await User.findByIdAndDelete(userExist?.id);
      
        if(!deletedUser) {
            return res.status(401).json({status: "failed", message: 'Unable to delete user'});
        }

        return res.status(200).json({status: "success", message: 'User deleted successfully'});

    } catch (error) {
        next(error)
    }
}



exports.resetPassword = async (req, res, next) => {

    const { email } = req.body;

    try {

        const result = await resetPasswordSchema.validateAsync({email});

        const userExist = await User.findOne({ email: result?.email });

        if(!userExist) throw createError.Conflict(`${result?.email} does not exist`);

        const resetToken = await resetPasswordToken(userExist);
        
        const sendPage = `https://fofoapp.herokuapp.com/api/auth/reset-password/${userExist?._id}/${resetToken}`;
        
        // SEND sendPage to email address
        //
        return res.status(200).json({status: "success", sendPage, resetToken });

    } catch (error) {
        return res.status(500).json({status: "failed", error: error?.message, message: error?.message })
    }
}

exports.getResetPasswordToken = async (req, res, next) => {

    const { id, token } = req.params;
    
    try {
        if(!id && !token) {
            return res.status(401).send({status: "failed", message: "User not verified"})
        }
        const doesExist = await User.findOne({ _id: id }).select('password -_id').lean();
       
        if(!doesExist) return res.status(404).json({status: "failed", message: "User does not exist"});

        const secret =  process.env.RESET_PASSWORD_SECRET_KEY + doesExist?.password;

        const payload  = JWT.verify(token, secret);
        
        if(!payload) {
            return res.status(401).send({status: "failed", message: 'Unable to verify user'});
        }
        //SEND OTP TO USER PHONE
        // Object.assign(doesExist, req.body);
        // doesExist.save();
        // console.log("user", doesExist)
        // const updatedUser =    await User.findByIdAndUpdate(id, dataToUpdate, { new: true });

        return res.status(200).send({status: "success", message: 'User verified'})

    } catch (error) {
        return res.status(500).json({status: "failed", error: error?.message, message: error?.message })
    }
}

exports.postResetPasswordToken = async (req, res, next) => {

    const { id, token } = req.params;
    const { password, confirmPassword } = req.body;

    if(password !== confirmPassword) {
        return res.status(401).json({status: "failed", error: 'Password mis-match'});
    }

    try {
        let doesExist = await User.findOne({ _id: id }).select('password -_id');

        if(!doesExist) return res.status(404).json({status: "failed", message: "User does not exist"});
        
        const { value: result } = await passwordOnlySchema({ password, confirmPassword });

        const secret =  process.env.RESET_PASSWORD_SECRET_KEY + doesExist.password;

        const payload  = JWT.verify(token, secret);
        
        if(!payload) {
            return res.status(401).json({status: "failed", message: 'Unable to verify user'});
        }
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        doesExist.password = hashedPassword;

        const passwordReset = await User.findByIdAndUpdate(id, { $set: doesExist }, { new: true });

        if(!passwordReset) {
            return res.status(400).json({ status: "failed", message: 'Unable to reset password' })
        }
        
        return res.status(200).send({ status: "success", message: 'User Password successfully updated'})

    } catch (error) {

        if(error?.details) {
            return res.status(401).send({error: error?.details[0]?.message});
        }

        return res.status(500).json({status: "failed", error: error?.message, message: error?.message })
    }
}

exports.updatePassword = async (req, res, next) => {

    const userId = req?.params?.userId;

    const { password, confirmPassword } = req.body;
    
    try {

        if(password !== confirmPassword) {
            return res.status(401).json({status: "failed", error: 'Password mis-match'});
        }

        if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(401).json({status: "failed", error: 'Invalid user id'});

        const user = await User.findOne({_id: userId});
        
        if(!user) return res.status(404).json({status: "failed", error: "User not found"});

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        const updatedPassword = await User.findByIdAndUpdate(user.id, {$set: { password: hashedPassword }});
        
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

        if(!updatedPassword) {
            return res.status(400).json({status: "failed", error: "Unable to update password"});
        }

        return res.status(200).json({ status: "failed", message: "Password updated successfully"});

    } catch (error) {
        return res.status(500).json({status: "failed", error: error?.message, message: error?.message  });
    }
}

exports.otpPage = async (req, res, next) => {

    const { email } = req.body;

    try {

        const user = await User.findOne({ email: email });

        if(!user) return res.status(404).send({ status: "failed", error: "User not found" });
        
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
        return res.status(401).json({ status: "failed", error: error?.message, message: error?.message });
    }
    
}


exports.verifyOtp = async (req, res, next) => {
    
    try {

        const { otp } = req.body;

        if(otp.length < 4 || otp.length > 4 ) {
            return res.status(200).json({ status: "failed", error: 'Input valid 4 digit otp code'})
        }
        
        const isOtpFound = await Otpmodel.findOne({ otp: otp })

        if(!isOtpFound) {
            return res.status(404).json({ status: "failed", error: 'OTP not found'})
        }

        const user = await User.findOne({_id: isOtpFound.userId})

        if(!user) return res.status(400).json({ status: "failed", error: "Unprocessible OTP ", stage: 1 });
        
        
        const verified = await User.findByIdAndUpdate(isOtpFound.userId, { $set: { accountVerified: true }}, { new: true});
       
        if(verified) {
            await Otpmodel.findByIdAndDelete(isOtpFound.id);
        }

        const { _id: id, email, roles, fullname: username, field } = verified;

        const userObject = {  id, email, roles, username, field };

        if(verified?.profileImagePath) {
            userObject.profileImagePath = verified?.profileImagePath
        }
          
        const accessToken = signInAccessToken(userObject);

        const refreshToken = signInRefreshToken(userObject);

        let refreshAccessToken = await RefreshAccessToken.findOne({ userId: verified.id });
        
        if(refreshAccessToken) {
            await refreshAccessToken.remove();
        }

        refreshAccessToken = new RefreshAccessToken({ userId: verified?.id,  accessToken, refreshToken });
        
        await refreshAccessToken.save();

        const userdata = {
            success: true,
            message: "Otp verified",
            stage: 2,
            accessToken,
            refreshToken,
            userId: verified?.id
        }

        return res.status(200).send(userdata);

    } catch (error) {
        
        next(error)
    }
    
}

exports.followAndUnfollow = async (req, res, next) => {
    
    const userId = req.user?.id;

    const { followId } = req.params;
    
    try {

        const userExist = await User.findById(userId)
        const followExist = await User.findById(followId)

        if(!userExist) {
            return res.status(404).json({ status: 'failed', message: `Follow ID: ${userId} does not exist` })
        }

        if(!followExist) {
            return res.status(404).json({ status: 'failed', message: `Follower ID: ${followId} does not exist`})
        }

        if(followExist?.id === userId) {
            return res.status(400).json({ status: 'failed', message: `You can't follow yourself`})
        }

        if(followExist?.followers?.includes(userId)) {
            followExist.followers.pull(userId)
            userExist.following.pull(followId)
            await userExist.save();
            await followExist.save();
            return res.status(200).json({ status: "success", message: "Unfollowed"})

        } else {
            userExist.following.addToSet(userId)
            followExist.followers.addToSet(userId)
            await userExist.save();
            await followExist.save();
            return res.status(200).json({ status: "success", message: "Followed"})

        }

    } catch (error) {
        return res.status(500).json({ status: 'failed', message: "Server error following and unfollowing a user"})
    }
}


