const mongoose = require('mongoose');

const profileImageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref:"User", required: true  },
 
    profileImageCloudinaryPublicId: { type: String, required: true  },
    profileImage: { type: String, required: true },

    post: { type: Array },
    
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

}, { timestamps: true });

const Profile = mongoose.model('Profile', profileImageSchema);

module.exports = Profile;