
const express = require('express');

const AuthController = require('./../controllers/AuthController');
const { registerSchema } = require('./../validations/userSchema');
const { validate } = require('./../validations/validationMiddleware');
const { permissions } = require('./../middlewares/permissionsMiddleware');
 
const { verifyAccessToken } = require('./../helpers/jwtHelper');

const upload = require('./../helpers/multer');

const router = express.Router();
//CHANGE ROUTES:
//signup, signin, signout

router.post('/register', AuthController.register);

router.post('/login', AuthController.login);

router.post('/refresh-token', verifyAccessToken, AuthController.refreshToken);

router.post('/reset-password', AuthController.resetPassword);
router.get('/reset-password/:id/:token', AuthController.getResetPasswordToken);

router.patch('/reset-password/:id/:token', AuthController.postResetPasswordToken);

router.post('/logout',  AuthController.logout);

// router.get('/verifyotp/:id', AuthController.otpPage);
router.post('/verifyotp', AuthController.verifyOtp);

router.patch('/user/:userId/update', verifyAccessToken,  AuthController.updateUser);

router.patch('/upload-profile-picture/:userId/upload', verifyAccessToken, upload.single('profileImage'),  AuthController.uploadProfilePicture);

router.delete('/user/:userId/delete', verifyAccessToken, permissions(["admin"]), AuthController.deleteUser);


module.exports = router;