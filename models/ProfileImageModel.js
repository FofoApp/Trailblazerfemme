const mongoose = require('mongoose');

const profileImageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref:"User", required: true  },
 
    profileImageCloudinaryPublicId: { type: String, unique:true, required: true, default: null },
    profileImage: { type: String, required: true, default: null },

    post: { type: Array },
    
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

}, { timestamps: true });

const Profile = mongoose.model('Profile', profileImageSchema);

module.exports = Profile;