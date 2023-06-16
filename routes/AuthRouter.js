
const express = require('express');

const AuthController = require('./../controllers/AuthController');
const AdminUserController = require('./../controllers/adminController/AdminUserController');

// const { registerSchema } = require('./../validations/userSchema');

const { permissions } = require('./../middlewares/permissionsMiddleware');
 
const { verifyAccessToken } = require('./../helpers/jwtHelper');

const upload = require('./../helpers/multer');

const router = express.Router();
//CHANGE ROUTES:
//signup, signin, signout

router.post('/register', AuthController.register);

router.post('/login',  AuthController.login);

router.post('/default-user',  AuthController.createDefaultAdmin);

router.get('/dashboard-list-users', AdminUserController.dashboardListUsers);


//Blocked user routes
router.patch('/block-user', verifyAccessToken, permissions(["admin"]), AdminUserController.blockUser);
router.patch('/unblock-user', verifyAccessToken, permissions(["admin"]), AdminUserController.unblockUser);
router.get('/list-block-users', verifyAccessToken, permissions(["admin"]), AdminUserController.listblockedUsers);
router.get('/show-blocked-user', verifyAccessToken, permissions(["admin"]), AdminUserController.showblockedUser);
router.get('/finduser', verifyAccessToken, permissions(["admin"]), AdminUserController.findUserByEmail);

router.post('/manually-create-admin', verifyAccessToken, permissions(["admin"]), AdminUserController.manuallyCreateAdmin);
router.patch('/manually-upgrade-to-admin', verifyAccessToken, permissions(["admin"]), AdminUserController.manuallyUpgradeToAdmin);
router.patch('/make-admin', verifyAccessToken, permissions(["admin"]), AdminUserController.manuallyUpgradeToAdmin);


//FIND A USER 
router.get('/users', verifyAccessToken, permissions(["admin"]), AdminUserController.allUsers);
router.get('/user/find', verifyAccessToken, permissions(["admin"]), AdminUserController.findUser);

router.post('/refresh-token', verifyAccessToken, AuthController.refreshToken);

// router.post('/reset-password', AuthController.resetPassword);
// router.post('/reset-password/:id/:token', AuthController.getResetPasswordToken);



router.patch('/reset-password/:id/:token', AuthController.postResetPasswordToken);

router.post('/logout',  AuthController.logout);

// router.get('/verifyotp/:id', AuthController.otpPage);

router.post('/reset-password', AuthController.resetPassword);

router.post('/verifyotp', verifyAccessToken, AuthController.verifyOtp);
router.post('/resend-otp', AuthController.otpPage);
router.patch('/follow-unfollow/:followId',  verifyAccessToken, AuthController.followAndUnfollow);
router.patch('/update-password/:userId', AuthController.updatePassword);


router.patch('/user/:userId/update', verifyAccessToken,  upload.single('profileImage'),  AuthController.updateUser);

router.patch('/upload-profile-picture/:userId/upload', verifyAccessToken, upload.single('profileImage'),  AuthController.uploadProfilePicture);

router.delete('/user/:userId/delete', verifyAccessToken, permissions(["admin"]), AuthController.deleteUser);


module.exports = router;