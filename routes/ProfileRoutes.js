const express = require('express');
const ProfileController = require('./../controllers/ProfileController');
const router = express.Router();
const upload = require('./../helpers/multer');
const { verifyAccessToken } = require('./../helpers/jwtHelper');



router.get('/', verifyAccessToken, ProfileController.profile);
router.patch('/user/:userId/follow', verifyAccessToken, ProfileController.follow);
router.get('/get-profile-images',  ProfileController.getAllProfileImages);
router.get('/get-profile-image/:id',  ProfileController.getProfileImage);
router.post('/upload-profile-image/:id', upload.single('profileImage'),  ProfileController.uploadProfileImage);
router.patch('/update-profile-image/:id', upload.single('profileImage'),  ProfileController.updateProfileImage);
router.delete('/delete-profile-image/:id', ProfileController.deleteProfileImage);

module.exports = router;