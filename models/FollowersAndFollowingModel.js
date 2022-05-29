const mongoose = require('mongoose');


const followersAndFollowingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  followers: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  following: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });


const FollowersAndFollowings = mongoose.model("FollowersAndFollowings", followersAndFollowingSchema);
module.exports = FollowersAndFollowings;