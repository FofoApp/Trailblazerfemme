const mongoose = require('mongoose');
const Profile = require('./../models/ProfileImageModel');
const UserModel = require('./../models/UserModel');
const CommunityModel = require('./../models/community/CommunityModel');
const FollowersAndFollowings = require('./../models/FollowersAndFollowingModel');
const { cloudinary } = require('./../helpers/cloudinary')



exports.profile = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/profile

    let userId = req.user.id;

    try {

        if(!mongoose.Types.ObjectId.isValid(userId)) {

            return res.status(404).send({ message: "User not found!" });
        }

        let profile = await UserModel.aggregate([
            { $match: { "_id": mongoose.Types.ObjectId(userId) } },
            { $addFields: {
                followers: { $size: "$followers" },
                following: { $size: "$following" },
                booksRead: { $size: "$booksRead" },
             }},
            { $project: {
                id: "$_id",
                _id: 0,
                fullname: 1,
                profileImage:1, 
                followers:1,
                following:1,
                about:1,
                booksRead:1,
                membershipType: 1,
                paid: 1,
                isActive: 1,
                // roles: 1,
                roles: { $arrayElemAt: ["$roles", 0] },
            } }
        ])

        // profile = await UserModel.findOne({ userId: userId });

        if(!profile)  return res.status(404).send({error: "User profile not found"});

    
        return res.status(200).send({ profile: profile[0], });
        
    } catch (error) {

        return res.status(500).send({ error: error.message });
    }
}


exports.getAllProfileImages = async (req, res, next) => {
    try {
        // const plan = await planValidation({name, price});
       //Find user and ensure user with the speicifed id exist

        const profile = await UserModel.find({}).select(' profileImageCloudinaryPublicId profileImage');

        if(!profile) {
            return res.status(404).send({ error: "Profile pictures not found"});
        }
        
        return res.status(200).send(profile);

    } catch (error) {
        return res.status(500).send(error);
        // return next(error)
    }

}


exports.getProfileImage = async (req, res, next) => {
    const { userId } = req.params;

    try {
        // const plan = await planValidation({name, price});
       //Find user and ensure user with the speicifed id exist

        const findUserById = await User.findById(userId);

        const profile = await UserModel.findOne({ _id: findUserById._id }).select(' profileImageCloudinaryPublicId profileImage');

        if(!findUserById) {
            return res.status(404).send({ message: "User not found"});
        }

        if(!profile) {
            return res.status(404).send({ message: "Profile picture not found"});
        }
        

        return res.status(200).send({profileImage: profile });

    } catch (error) {
        return res.status(500).send(error);
        // return next(error)
    }

}

exports.uploadProfileImage = async (req, res, next) => {

    // const { userId } = req.params;
 
    const userId = req.params.userId;

    // upload-profile-image/:id
    // http://localhost:2000/api/profile/upload-profile-image/628696153cf50a6e1a34e2c5

    try {

        // const plan = await planValidation({name, price});
       //Find user and ensure user with the speicifed id exist

        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).send({ message: "User not found!" });
        }

        if(req.user && userId && req.user.id.toString() !== userId.toString()) {
            return res.status(400).send({ message: "You are not allowed to perform this operation" });
        }

        let findUserById = await UserModel.findById(userId);

        if(!findUserById) {
            return res.status(404).send({ message: "User not found"});
        }

        let uploaderResponse;
        
        if(findUserById.profileImage) {
            //If Image is already saved in the Database, Delete Previous from Cloudinary 
            uploaderResponse = await cloudinary.uploader.destroy(findUserById.profileImageCloudinaryPublicId);
        }


        //Reject if unable to upload image
        // if(!uploaderResponse) {            
        //     return res.status(404).send({ message: "Unable to delete previous image"});
        // }

        //Upload Image to cloudinary
        uploaderResponse = await cloudinary.uploader.upload(req.file.path);
        
        if(!uploaderResponse) {
            //Reject if unable to upload image
            return res.status(404).send({ message: "Unable to upload image please try again"});
        }

        findUserById.profileImage = uploaderResponse.secure_url;
        findUserById.profileImageCloudinaryPublicId = uploaderResponse.public_id;

        await findUserById.save();

        return res.status(201).send({ message: "Profile image saved successfully" });

    } catch (error) {

        return res.status(500).send({error: error.message });
  
    }

}

exports.updateProfileImage = async (req, res, next) => {
    const { id } = req.params; 

    try {
       //Find user and ensure user with the speicifed id exist

        let findUserById = await User.findById(id);
        if(!findUserById) {
            return res.status(404).send({ message: "User not found"});
        }

        let profile = await Profile.findOne({ userId: findUserById._id });
        if(!profile) {
            return res.status(404).send({ message: "Profile image not found"});
        }
        
        if(!profile.profileImageCloudinaryPublicId) {
            return res.status(404).send({ message: "Profile image not found"});
        }

        //Upload Image to cloudinary
        let uploaderResponse = await cloudinary.uploader.destroy(profile.profileImageCloudinaryPublicId);        
        if(!uploaderResponse) {
            //Reject if unable to upload image
            return res.status(404).send({ message: "Unable to delete profile image please try again"});
        }
         //Upload Image to cloudinary
         uploaderResponse = await cloudinary.uploader.upload(req.file.path);

        profile = Object.assign(profile, {
            userId: findUserById._id,
            profileImageCloudinaryPublicId: uploaderResponse.public_id,
            profileImage: uploaderResponse.secure_url
        });

        profile.save();
        
        return res.status(200).send({ message: "Profile image updated successfully" });

    } catch (error) {
        return res.status(500).send(error);
        // return next(error)
    }   
}

exports.addFollowing = async (req, res, next) => {
    //http://localhost:2000/api/profile/user/628696153cf50a6e1a34e2c5/follow

    const currentUser = req.user.id;
    const followId = req.params.userId;

    try {
        const addFollowing = await Profile.findByIdAndUpdate(currentUser, {$push: {following: followId }}, { new: true });
        if(!addFollowing)  return res.status(400).json({ error: "Unable to follow user"});

        next();

    } catch (error) {
        
    }
}
exports.addFollowers = async (req, res, next) => {
    const currentUser = req.user.id;
    const followId = req.params.userId;

    try {
        const addFollower = await Profile.findByIdAndUpdate(followId, {$push: {followers: currentUser }}, { new: true })
        .populate("following", "_id fullname")
        .populate("followers", "_id fullname")

        if(!addFollower)  return res.status(400).json({ error: "Unable to follow user"});
        return res.status(200).json(addFollower);
        
    } catch (error) {
        
    }
}

exports.follow = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/profile/user/userId/follow
    //http://localhost:2000/api/profile/user/628696153cf50a6e1a34e2c5/follow
    //
    const currentUser = req.user.id;
    const follow = req.params.userId;

    try {

        if(!mongoose.Types.ObjectId.isValid(currentUser)) {

            return res.status(404).send({ message: "User not found!" });
        }
        
        if(!mongoose.Types.ObjectId.isValid(follow)) {

            return res.status(404).send({ message: "The account you want to follow cannot be found!" });
        }

        const user = await UserModel.findOne({ _id: currentUser }).select('_id fullname');

        if(currentUser === user._id) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const followerAndFollowing  = await Promise.all([ 
            UserModel.findByIdAndUpdate(currentUser, { $addToSet: { following: follow }}),
            UserModel.findByIdAndUpdate(follow, { $addToSet: { followers: currentUser }})
        ]);


        if(followerAndFollowing) {
            return res.status(200).send({ message: `Success`, followerAndFollowing });
        }

        
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.deleteProfileImage = async (req, res, next) => {
    const { id } = req.params;

    try {
       //Find user and ensure user with the speicifed id exist

        const findUserById = await User.findById(id);

        const profile = await Profile.findOne({ userId: findUserById._id });

        if(!findUserById) {
            return res.status(404).send({ message: "User not found"});
        }
        if(!profile) {
            return res.status(404).send({ message: "Profile image not found"});
        }
        // if(!profile.public_id) {
        //     return res.status(404).send({ message: "Profile image not found"});
        // }
        //Upload Image to cloudinary
        const uploaderResponse = await cloudinary.uploader.destroy(profile.publicId);
        
        if(!uploaderResponse) {
            //Reject if unable to upload image
            return res.status(404).send({ message: "Unable to delete profile image please try again"});
        }
        
        //Save new Image path to database
        await profile.remove();
        
        return res.status(201).send({ message: "Profile image deleted successfully" });

    } catch (error) {
        return res.status(500).send(error);
        // return next(error)
    }   
}

