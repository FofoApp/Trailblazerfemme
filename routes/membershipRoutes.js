
const express = require('express');

const AuthController = require('./../controllers/AuthController');
const AdminUserMembershipController = require('./../controllers/adminController/AdminUserMembershipController');
const { registerSchema } = require('./../validations/userSchema');

const { validate } = require('./../validations/validationMiddleware');

const { permissions } = require('./../middlewares/permissionsMiddleware');
 
const { verifyAccessToken } = require('./../helpers/jwtHelper');

const upload = require('./../helpers/multer');

const router = express.Router();
//CHANGE ROUTES:
//signup, signin, signout

router.post('/create', AdminUserMembershipController.createUserMembership);
router.get('/:membershipId/find', AdminUserMembershipController.findUserMembershipById);
router.get('/lists', AdminUserMembershipController.listUserMembership);
router.patch('/:membershipId/update', AdminUserMembershipController.updateUserMembership);
router.delete('/:membershipId/delete', AdminUserMembershipController.deleteUserMembership);

// router.post('/login', AuthController.login);

// router.patch('/upload-profile-picture/:userId/upload', verifyAccessToken, upload.single('profileImage'),  AuthController.uploadProfilePicture);

// router.delete('/user/:userId/delete', verifyAccessToken, permissions(["admin"]), AuthController.deleteUser);


module.exports = router;