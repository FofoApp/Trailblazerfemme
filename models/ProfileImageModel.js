const mongoose = require('mongoose');

const profileImageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref:"User", required: true  },
    publicId: { type: String, unique: true, required: true },
    image_path: {type: String, required: true },
    post: { type: Array },
    followers: { type: Array, default: [] },
    following: { type: Array, default: [] }

}, { timestamps: true });

const Profile = mongoose.model('Profile', profileImageSchema);

module.exports = Profile;