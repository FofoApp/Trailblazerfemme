const mongoose = require('mongoose');
const Profile = require('./../models/ProfileImageModel');
const UserModel = require('./../models/UserModel');
const CommunityModel = require('./../models/community/CommunityModel');
const FollowersAndFollowings = require('./../models/FollowersAndFollowingModel');
const { cloudinary } = require('./../helpers/cloudinary')



const profile = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/profile

    let userId = req.user.id;

    try {

        if(!mongoose.Types.ObjectId.isValid(userId)) {

            return res.status(404).send({ message: "User not found!" });
        }

        // const usR = await UserModel.findById(userId).populate('followers', '_id fullname').populate('following', '_id fullname');
        // return res.status(200).send(usR)

        const user = await UserModel.findOne({ _id: userId }).select('-password -createdAt -updatedAt -__v').populate('followers', '_id fullname').populate('following', '_id fullname');
        
        const communities = await CommunityModel.find().sort({ createdAt: -1 }).limit(10).select('-createdAt -updatedAt -__v');

        return res.status(200).send({ user, communities });
        
    } catch (error) {

        return res.status(500).send({ message: error.message });
    }
}


const getAllProfileImages = async (req, res, next) => {
    try {
        // const plan = await planValidation({name, price});
       //Find user and ensure user with the speicifed id exist

        const profile = await Profile.find({}).select('_id userId publicId image_path');

        if(!profile) {
            return res.status(404).send({ message: "Profile picture not found"});
        }
        
        return res.status(200).send({profileImages: profile });

    } catch (error) {
        return res.status(500).send(error);
        // return next(error)
    }

}


const getProfileImage = async (req, res, next) => {
    const { id } = req.params;

    try {
        // const plan = await planValidation({name, price});
       //Find user and ensure user with the speicifed id exist

        const findUserById = await User.findById(id);

        const profile = await Profile.findOne({ userId: findUserById.id }).select('_id userId publicId image_path');

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

const uploadProfileImage = async (req, res, next) => {
    const { id } = req.params;

    try {
        // const plan = await planValidation({name, price});
       //Find user and ensure user with the speicifed id exist

        const findUserById = await User.findById(id);
        const profile = await Profile.findOne({ userId: findUserById.id });
        if(!findUserById) {
            return res.status(404).send({ message: "User not found"});
        }

        if(profile) {
            return res.status(404).send({ message: "You already have an existing profile image"});
        }
        //Upload Image to cloudinary
        const uploaderResponse = await cloudinary.uploader.upload(req.file.path);
        
        if(!uploaderResponse) {
            //Reject if unable to upload image
            return res.status(404).send({ message: "Unable to upload image please try again"});
        }
        
        //Save new Image path to database
        const uploadNewImage = await Profile.create({
            userId: id,
            publicId: uploaderResponse.public_id,
            image_path: uploaderResponse.secure_url,
        });
        

        return res.status(201).send({ message: "Plan created successfully", uploadNewImage });

    } catch (error) {
        return res.status(500).send(error);
        // return next(error)
    }

}

const updateProfileImage = async (req, res, next) => {
    const { id } = req.params;

    try {
       //Find user and ensure user with the speicifed id exist

        let findUserById = await User.findById(id);

        let profile = await Profile.findOne({ userId: findUserById.id });

        if(!findUserById) {
            return res.status(404).send({ message: "User not found"});
        }
        if(!profile) {
            return res.status(404).send({ message: "Profile image not found"});
        }
        
        if(!profile.public_id) {
            return res.status(404).send({ message: "Profile image not found"});
        }

        //Upload Image to cloudinary
        let uploaderResponse = await cloudinary.uploader.destroy(profile.publicId);        
        if(!uploaderResponse) {
            //Reject if unable to upload image
            return res.status(404).send({ message: "Unable to delete profile image please try again"});
        }
         //Upload Image to cloudinary
         uploaderResponse = await cloudinary.uploader.upload(req.file.path);

        profile = Object.assign(profile, {
            userId: findUserById.id,
            publicId: uploaderResponse.public_id,
            image_path: uploaderResponse.secure_url
        });

        profile.save();
        
        return res.status(201).send({ message: "Profile image updated successfully", profile });

    } catch (error) {
        return res.status(500).send(error);
        // return next(error)
    }   
}

const follow = async (req, res, next) => {
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

const deleteProfileImage = async (req, res, next) => {
    const { id } = req.params;

    try {
       //Find user and ensure user with the speicifed id exist

        const findUserById = await User.findById(id);

        const profile = await Profile.findOne({ userId: findUserById.id });

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

module.exports = {
    uploadProfileImage,
    deleteProfileImage,
    updateProfileImage,
    getProfileImage,
    getAllProfileImages,
    profile,
    follow
}