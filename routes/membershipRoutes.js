
const express = require('express');

const AuthController = require('./../controllers/AuthController');
const MembershipController = require('./../controllers/membershipController/MembershipController');
const AdminUserMembershipController = require('./../controllers/adminController/AdminUserMembershipController');
const MembershipReviewController = require('./../controllers/membershipController/MembershipReviewController');

const { membershipPayment } = require('../controllers/stripeController/stripeController')


const { registerSchema } = require('./../validations/userSchema');

const { validate } = require('./../validations/validationMiddleware');

const { permissions } = require('./../middlewares/permissionsMiddleware');
 
const { verifyAccessToken } = require('./../helpers/jwtHelper');

const upload = require('./../helpers/multer');

const router = express.Router();
//CHANGE ROUTES:
//signup, signin, signout


router.get('/list-memberships', verifyAccessToken, permissions(["user", "admin"]),  MembershipController.listMemberships);
router.post('/create_review', verifyAccessToken, permissions(["user", "admin"]),  MembershipReviewController.createMembershipReview, MembershipReviewController.getReviews);
router.post('/subscribe',  verifyAccessToken, permissions(["user", "admin"]),  MembershipController.chooseMembershipPlan);
router.post('/create', verifyAccessToken, permissions(["admin"]), AdminUserMembershipController.createUserMembership);
router.get('/:membershipId/find', verifyAccessToken, AdminUserMembershipController.findUserMembershipById);
router.get('/lists', verifyAccessToken, AdminUserMembershipController.listUserMembership);
router.patch('/:membershipId/update', verifyAccessToken, permissions(["admin"]), AdminUserMembershipController.updateUserMembership);
router.delete('/:membershipId/delete', verifyAccessToken, permissions(["admin"]), AdminUserMembershipController.deleteUserMembership);


// router.post('/login', AuthController.login);

// router.patch('/upload-profile-picture/:userId/upload', verifyAccessToken, upload.single('profileImage'),  AuthController.uploadProfilePicture);

// router.delete('/user/:userId/delete', verifyAccessToken, permissions(["admin"]), AuthController.deleteUser);


module.exports = router;