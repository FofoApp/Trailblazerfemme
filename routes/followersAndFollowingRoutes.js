const express = require('express');
const router = express.Router();


const followersAndFollowingController = require('./../controllers/followersAndFollowingController');


router.patch('/:userId/follow', followersAndFollowingController.follow);


module.exports = router;