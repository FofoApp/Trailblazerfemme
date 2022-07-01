const express = require('express');
const router = express.Router();
const ProfileController = require('./../controllers/ProfileController');
const upload = require('./../helpers/multer');
const { verifyAccessToken } = require('./../helpers/jwtHelper');



router.get('/', verifyAccessToken, ProfileController.profile);
router.patch('/user/:userId/follow', verifyAccessToken, ProfileController.follow);
router.get('/get-profile-images', verifyAccessToken,  ProfileController.getAllProfileImages);
router.get('/get-profile-image/:userId', verifyAccessToken,  ProfileController.getProfileImage);
router.post('/upload-profile-image/:userId', verifyAccessToken, upload.single('profileImage'),  ProfileController.uploadProfileImage);
router.patch('/update-profile-image/:userId', verifyAccessToken, upload.single('profileImage'),  ProfileController.updateProfileImage);
router.delete('/delete-profile-image/:userId', verifyAccessToken, ProfileController.deleteProfileImage);

module.exports = router;