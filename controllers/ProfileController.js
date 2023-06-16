const mongoose = require('mongoose');
const Profile = require('./../models/ProfileImageModel');
const UserModel = require('./../models/UserModel');
const CommunityModel = require('./../models/community/CommunityModel');
const FollowersAndFollowings = require('./../models/FollowersAndFollowingModel');
const { cloudinary } = require('./../helpers/cloudinary')



exports.profile = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/profile

    let userId = req?.user?.id;

    try {

        if(!mongoose.Types.ObjectId.isValid(userId)) {

            return res.status(404).json({ message: "User not found!" });
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

                location: 1,
                city:1,
                state: 1,
                field: 1,
                jobTitle: 1,
                socialLinks: 1,

                about:1,
                booksRead:1,
                membershipType: 1,
                paid: 1,
                email: 1,
                phonenumber: 1,
                isActive: 1,
                // roles: 1,
                roles: { $arrayElemAt: ["$roles", 0] },
            } }
        ]);

        // profile = await UserModel.findOne({ userId: userId });

        if(!profile) {
            return res.status(404).json({status: "failed", message: "User profile not found"});
        }

        return res.status(200).json({status: "success", profile: profile[0], });
        
    } catch (error) {

        console.log(error)

        return res.status(500).json({status: "failed", error: error?.message });
    }
}


exports.getAllProfileImages = async (req, res, next) => {
    try {
        // const plan = await planValidation({name, price});
       //Find user and ensure user with the speicifed id exist

        const profile = await UserModel.find({}).select(' profileImageCloudinaryPublicId profileImage');

        if(!profile) {
            return res.status(404).json({status: "failed", message: "Profile pictures not found"});
        }
        
        return res.status(200).json({ status: "success", profile });

    } catch (error) {
        return res.status(500).json({status: "failed", error: error?.message });
        // return next(error)
    }

}


exports.getProfileImage = async (req, res, next) => {
    const { userId } = req.params;

    try {
        // const plan = await planValidation({name, price});
       //Find user and ensure user with the speicifed id exist

        const findUserById = await User.findById(userId);

        if(!findUserById) {
            return res.status(404).json({status: "failed", message: "User not found"});
        }

        const profile = await UserModel.findOne({ _id: findUserById._id }).select(' profileImageCloudinaryPublicId profileImage');

        if(!profile) {
            return res.status(404).json({status: "failed", message: "Profile picture not found"});
        }

        return res.status(200).json({ profileImage: profile });

    } catch (error) {
        return res.status(500).json({status: "failed", error: error?.message });
        // return next(error)
    }

}

exports.uploadProfileImage = async (req, res, next) => {

    const { userId } = req.params;

    // upload-profile-image/:id
    // http://localhost:2000/api/profile/upload-profile-image/628696153cf50a6e1a34e2c5

    try {

        // const plan = await planValidation({name, price});
       //Find user and ensure user with the speicifed id exist

        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({ status: "failed", message: "Invalid user id!" });
        }

        if(req?.user && userId && req?.user?.id?.toString() !== userId?.toString()) {
            return res.status(400).json({ status: "failed", message: "You are not allowed to perform this operation" });
        }

        // Check if an image was upload, if not reject further request
        if(!req?.file) {
            return res.status(400).json({ status: "failed", message: "Please provide an image to upload" });
        }

        // Find user by userId
        let findUserById = await UserModel.findById(userId);

        // End the request if user id not found
        if(!findUserById) {
            return res.status(404).json({ status: "failed", message: "User not found"});
        }

        // Check if an image was already uploaded
        if(findUserById?.profileImage) {
            //If Image is already saved in the Database, Delete Previous profile image from Cloudinary 
            const deleteResponse = await cloudinary.uploader.destroy(findUserById?.profileImageCloudinaryPublicId);

            //Reject if unable to upload image
            if(!deleteResponse) {
                return res.status(400).json({ status: "failed", message: "User ro delete previous profile image"});
            }
        }

        //Upload Image to cloudinary
        const { public_id, secure_url } = await cloudinary.uploader.upload(req?.file?.path);
        
        if(!public_id && !secure_url) {
            //Reject if unable to upload image
            return res.status(400).json({ status: "failed", message: "Unable to upload image please try again"});
        }

        // Add the new user image the user document in the database
        findUserById.profileImage = secure_url;
        findUserById.profileImageCloudinaryPublicId = public_id;

        // Save user document
        await findUserById.save();

        return res.status(200).json({ status: "success", message: "Profile image saved successfully" });

    } catch (error) {
        return res.status(500).json({ status: "failed", error: error?.message });
  
    }

}

exports.updateProfileImage = async (req, res, next) => {
    
    const { id } = req.params; 

    try {
        //Check if userId is a valid mongoose id, if not reject the request
        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ status: "failed", message: "Invalid user id!" });
        }

       //Find user and ensure user with the speicifed id exist
        let findUserById = await UserModel.findById(id);

        if(!findUserById) {
            return res.status(404).json({status: "failed", message: "User not found"});
        }

        let profile = await Profile.findOne({status: "failed", userId: findUserById._id });

        if(!profile) {
            return res.status(400).json({status: "failed", message: "Profile image not found"});
        }
        
        if(!profile.profileImageCloudinaryPublicId) {
            return res.status(400).json({status: "failed", message: "Profile image not found"});
        }

        //Upload Image to cloudinary
        let deleteResponse = await cloudinary.uploader.destroy(profile?.profileImageCloudinaryPublicId);        
        if(!deleteResponse) {
            //Reject if unable to upload image
            return res.status(400).json({ status: "failed", message: "Unable to delete profile image please try again"});
        }
         //Upload Image to cloudinary
         const uploaderResponse = await cloudinary.uploader.upload(req?.file?.path);

         if(!uploaderResponse) {
           //Reject the request if image was not uploaded to cloudinary
           return res.status(400).json({ status: "failed", message: "Unable to delete profile image please try again"});
         }

        //Copy and update and edit user profile
        profile = Object.assign(profile, {
            profileImageCloudinaryPublicId: uploaderResponse?.public_id,
            profileImage: uploaderResponse?.secure_url
        });

        //Copy and update and edit user profile
        findUserById = Object.assign(findUserById, {
            profileImageCloudinaryPublicId: uploaderResponse?.public_id,
            profileImage: uploaderResponse?.secure_url
        });

        await findUserById.save();
        await profile.save();
        
        return res.status(200).json({status: "success", message: "Profile image updated successfully" });

    } catch (error) {
        return res.status(500).json({status: "failed", error: error?.message });
        // return next(error)
    }   
}


exports.updateProfileInfo = async (req, res, next) => {

    const { id } = req.user; 
    
    try {

        //Check if userId is a valid mongoose id, if not reject the request
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ status: "failed", message: "Invalid user id!" });
        }

        let userExist = await UserModel.findById(id);

        if(!userExist) {
            return res.status(404).json({ status: 'failed', message: "User not found"})
        }

        let acceptFields = ["fullname", "phonenumber", "email", "city", "state", "jobTitle", "field", "socialLinks"]

       
        const data =  Object.entries(req.body).map(([key, value]) => {

            if(!acceptFields.includes(key) || key == undefined) {
                delete req.body[key]
            }


            if(value.trim() === '' ) {
                delete req.body[key]
            }

            
        })


        let updatedInfo = await UserModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });

    
        if(!updatedInfo) {
            return res.status(400).json({ status: 'failed', message: "Unable to update user image"})
        }

        return res.status(200).json({ status: 'success', message: "Profile updated"})

    } catch (error) {
        return res.status(500).json({ status: 'failed', message: "Server error updating profile info"})
    }
}

exports.addFollowing = async (req, res, next) => {
    //http://localhost:2000/api/profile/user/628696153cf50a6e1a34e2c5/follow

    const currentUser = req?.user?.id;
    const followId = req?.params?.userId;

    try {
        const addFollowing = await Profile.findByIdAndUpdate(currentUser, {$addToSet: {following: followId }}, { new: true });
        if(!addFollowing)  return res.status(400).json({ status: "failed", error: "Unable to follow user"});

        next();

    } catch (error) {
        return res.status(500).json({ status: "failed", message: error?.message })
    }
}


exports.addFollowers = async (req, res, next) => {
    const currentUser = req?.user?.id;
    const followId = req?.params?.userId;

    try {
        const addFollower = await Profile.findByIdAndUpdate(followId, { $addToSet: { followers: currentUser }}, { new: true })
        .populate("following", "_id fullname")
        .populate("followers", "_id fullname")

        if(!addFollower)  {
            return res.status(400).json({ status: "failed", error: "Unable to follow user", message: "Unable to follow user" });
        }

        return res.status(200).json({ status: "success", addFollower });
        
    } catch (error) {
        return res.status(500).json({ status: "failed", message: error?.message })
    }
}

exports.follow = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/profile/user/userId/follow
    //http://localhost:2000/api/profile/user/628696153cf50a6e1a34e2c5/follow
    //
    const currentUser = req?.user?.id;
    const follow = req?.params?.userId;

    try {

        if(!mongoose.Types.ObjectId.isValid(currentUser)) {
            return res.status(404).json({ status: "failed", message: "User not found!" });
        }
        
        if(!mongoose.Types.ObjectId.isValid(follow)) {

            return res.status(404).json({ status: "failed", message: "The account you want to follow cannot be found!" });
        }

        const user = await UserModel.findById(currentUser).select('_id fullname');

        if(currentUser === user._id.toString()) {
            return res.status(400).json({ status: "failed", message: 'You cannot follow yourself' });
        }

        const followerAndFollowing  = await Promise.all([
            UserModel.findByIdAndUpdate(currentUser, { $addToSet: { following: follow }}),
            UserModel.findByIdAndUpdate(follow, { $addToSet: { followers: currentUser }})
        ]);


        if(followerAndFollowing) {
            return res.status(200).json({ status: "success", message: `success`, followerAndFollowing });
        }
        
    } catch (error) {
        return res.status(500).json({ status: "failed",  message: error.message });
    }
}

exports.deleteProfileImage = async (req, res, next) => {

    const { id } = req?.params;

    try {

        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ status: "failed", message: "User not found!" });
        }

       //Find user and ensure user with the speicifed id exist
        let findUserById = await User.findById(id);

        let profile = await Profile.findOne({ userId: id });

        if(!findUserById) {
            return res.status(404).json({ status: "failed", message: "User not found"});
        }

        if(!profile) {
            return res.status(404).json({ status: "failed", message: "Profile image not found"});
        }
  
        //Delete profileImage from cloudinary
        const profileDeleteResponse = await cloudinary.uploader.destroy(profile?.publicId);
       
        if(!profileDeleteResponse) {
            //Reject if unable to upload image
            return res.status(404).json({ status: "failed", message: "Unable to delete profile image please try again"});
        }

        //Delete userProfile Image from  cloudinary
        const userDeleteResponse = await cloudinary.uploader.destroy(findUserById?.publicId);
        
        if(!userDeleteResponse) {
            //Reject if unable to upload image
            return res.status(404).json({ status: "failed", message: "Unable to delete profile image please try again"});
        }
        
        //set image path to null
        findUserById.profileImageCloudinaryPublicId = null;
        findUserById.profileImage = null;
        await findUserById.save();

        //set image path to null
        profile.profileImageCloudinaryPublicId = null;
        profile.profileImage = null;
        await profile.save();
        
        return res.status(200).json({ status: "failed", message: "Profile image deleted successfully" });

    } catch (error) {
        return res.status(500).json({ status: "failed", message: error?.message });
        // return next(error)
    }   
}

