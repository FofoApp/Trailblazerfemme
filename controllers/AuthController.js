const fs = require('fs');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const { cloudinary } = require('./../helpers/cloudinary');


const { registerSchema, 
    loginSchema, 
    resetPasswordSchema, 
    passwordOnlySchema, 
    otpValidation } = require('../validations/userValidationSchema');
const User = require('./../models/UserModel');
const Otpmodel = require('../models/OtpModel');
const RefreshAccessToken = require('./../models/RefreshAccessTokenModel');
const FollowersAndFollowingModel = require('./../models/FollowersAndFollowingModel');

const { signInAccessToken, signInRefreshToken, verifyRefreshToken, resetPasswordToken } = require('./../helpers/jwtHelper');

const client = require('./../helpers/initRedis');

const { generateFourDigitsOTP } = require('./../helpers/otpGenerator');
const { sendGridMail } = require('./../helpers/sendGridMessaging');

const {sendSMS} = require('./../helpers/twilioSMS');
const {calculateNextPayment}  = require('./../helpers/billing');
const runCron = require('../runCron')
const moment = require('moment');
runCron();
const register = async (req, res, next) => {
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

        const result = await registerSchema(req.body);

        const doesExist = await User.findOne({ email: result.email });
        const date = calculateNextPayment(annually, moment().format());

        if(doesExist) throw createError.Conflict(`${result.email} already exist`);
       
        const user = new User({...result,  nextPaymentDate: date});
        // const follow = await FollowersAndFollowingModel.create({userId: user._id});
        const savedUser = await user.save();

        const otpCode = generateFourDigitsOTP();

        const otp = sendSMS(otpCode);
        const sentSms  = sendGridMail(user.email, otpCode);

        // if(!sentSms) {
        //     if(!otp) res.status(500).send({message: "Unable to send otp code via mail"});
        // }

        // if(!otp) res.status(500).send({message: "Unable to send otp"});

        // console.log("otp:", otp)

        const newOtp = await Otpmodel.create({ 
        userId: savedUser.id,
        phonenumber: savedUser.phonenumber,
        otp: otpCode
        });

        // if(!newOtp) {
        //     return res.status(500).send({message: "Unable to send otp"});
        // }

        const { email, roles, username, field, profileImagePath } = savedUser;

        const userObject = {  id: savedUser.id, email, roles, username, field, profileImagePath };
    
        const accessToken = await signInAccessToken(userObject)

        const refreshToken = await signInRefreshToken(userObject);



        let refreshAccessToken = await RefreshAccessToken.findOne({ userId: savedUser._id });
        
        if(refreshAccessToken) {
            await refreshAccessToken.remove();
        }

        refreshAccessToken = new RefreshAccessToken({userId: savedUser._id,  accessToken, refreshToken});
        
        await refreshAccessToken.save();

        return res.status(200).send({accessToken, refreshToken, otp:otpCode, message: "Otp has been sent to your phone"});

       
    } catch (error) {
        if(error.isJoi === true) {
            //unprocessible entry errors: server can't undestand or process the entries
            error.status = 422;
        }
        next(error)
    }
    
}


const login = async (req, res, next) => {
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
        const result = await loginSchema.validateAsync(req.body);
        
        const user = await User.findOne({ email: result.email });
       
        if(!user) {
            throw createError.NotFound("User not registered");
        }
        
        const isMatch = await user.isValidPassword(result.password);
        
        if(!isMatch) {
            throw createError.Unauthorized('Username/password not valid'); 
        }

        const accessToken = await signInAccessToken(user);
        const refreshToken = await signInRefreshToken(user);

        //if Refresh tokenn is set
        const isRefreshTokenSet = await RefreshAccessToken.findOne({userId: user.id});
       
        if(isRefreshTokenSet) {
            isRefreshTokenSet.remove();
        }
        const refreshAccessToken = new RefreshAccessToken({
            userId: user.id,
            accessToken:accessToken, 
            refreshToken:refreshToken
        });
        const savedRefreshAccessToken = await refreshAccessToken.save();
        
        return res.status(200).send({accessToken, refreshToken});

    } catch (error) {
        if(error.isJoi === true) {           
            return res.status(401).send({ message: error.message})
        }
        next(error);
    }
}


const refreshToken = async (req, res, next) => {
    
    try {
        const refreshToken = req.body;
        if(!refreshToken) {
            throw createError.BadRequest();
        }
        const userId = await verifyRefreshToken(refreshToken);
        const accessToken = await signInAccessToken(userId);
        const refToken = await signInRefreshToken(userId);
        return res.send({ accessToken: accessToken, refreshToken: refToken });
    } catch (error) {
        next(error);
    }
}

const logout = async (req, res, next) => {
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
        // return console.log(isRefreshTokenSet)
       
        if(!isRefreshTokenSet) {
            return res.status(404).send({ message: "Unable to logout user"})
        }

        await RefreshAccessToken.findByIdAndDelete({userId: userId});

        // client.DEL(userId, (err, val) => {
        //     if(err) {
        //         throw createError.InternalServerError();
        //     }
        //     res.status(204);
        // });

        return res.status(404).send({ message: "You are now logged out"})


    } catch (error) {
        // console.log(error)
        next(error);
    }
}


// ///ADMIN DASHBOARD LAYOUT
// const dashboardListUsers = async (req, res, next) => {
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

// const memberShip = async (req, res, next) => {
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

const updateUser = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/auth/user/:userId/update
    //http://localhost:2000/api/auth/user/62902e117ecadf9305054e1a/update
    const userId = req.user.id;

    try {

        let user  = await User.findById(req.user.aud).select('-__v -_id -socialLinks -isPaid -password').lean();
    
        if(!user) throw createError.Conflict(`User with ${user.email} does not exist`);

        user = {...req.body, roles: "user"};
        
        const result = registerSchema(user, true);

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

const uploadProfilePicture = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/auth/upload-profile-picture/:userId/upload
    //http://localhost:2000/api/auth/upload-profile-picture/62902e117ecadf9305054e1a/upload


    let currentUser = req.user.id;

    try {
        let user  = await User.findById(currentUser).select('-__v -_id -socialLinks -isPaid -password').lean();
    
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
                profileImagePath: uploaderResponse.secure_url
            }
        
        }, { new: true });

        if(updatedProfileImage) {

            fs.unlinkSync(req.file.path);

            return res.status(200).send({message: 'Profile Image Updated successfully'});
        }

   

    } catch (error) {
        // return res.status(401).send(error)
        next(error);
    }
       
}



const deleteUser = async (req, res, next) => {
    //DELETE REQUEST
    //http://localhost:2000/api/auth/user/:userId/delete
    //http://localhost:2000/api/auth/user/62902e117ecadf9305054e1a/delete

    try {
        const result = await User.findOne({ _id: req.params.id });

        if(!result) throw createError.Conflict(`User with ${req.body.email} does not exist`);

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



const resetPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const result = await resetPasswordSchema.validateAsync(req.body);

        const doesExist = await User.findOne({ email: result.email });

        if(!doesExist) throw createError.Conflict(`${result.email} does not exist`);

        const resetToken = await resetPasswordToken(doesExist)
        
        const sendPage = `http://localhost:2000/api/auth/reset-password/${doesExist._id}/${resetToken}`;
        //SEND sendPage to email address
        console.log(resetToken);
        return res.status(200).send({
            sendPage: sendPage,
            resetToken: resetToken
        })

    } catch (error) {
        console.log(error)
        return res.status(200).send(error)
    }
}

const getResetPasswordToken = async (req, res, next) => {
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
        console.log(error)
        return res.status(200).send(error)
    }
}

const postResetPasswordToken = async (req, res, next) => {
    const { id, token } = req.params;
    const { password, confirmPassword } = req.body;

    if(password !== confirmPassword) {
        return res.status(401).send({ error: 'Password mis-match'});
    }

    try {
        let doesExist = await User.findOne({ _id: id }).select('password -_id').lean();

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

// const otpPage = async (req, res, next) => {
    
//     try {
//         const otpExist = await Otpmodel.findOne({userId: req.params.id});
//         if(otpExist.otp === req.body.otpcode) {
//             return res.status(200).send({userId: req.params.id});
//         }
//     } catch (error) {
//         return res.status(401).send({ message: 'Otp verification failed'});
//     }
    
// }
const verifyOtp = async (req, res, next) => {
    
    try {
        const otp = await otpValidation(Number(req.body.otp));
        
        const isOtpFound = await Otpmodel.findOne({otp: Number(otp)});

        if(!isOtpFound) {
            return res.status(200).send({ message: 'Otp not found'});
        }

        return res.status(200).send({ message: 'Otp verified'});

    } catch (error) {
        next(error)
    }
    
}

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    updateUser,
    deleteUser,
    resetPassword,
    getResetPasswordToken,
    postResetPasswordToken,
    // otpPage,
    verifyOtp,
    uploadProfilePicture,
    // dashboardListUsers,
    // memberShip
}