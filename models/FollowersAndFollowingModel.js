const mongoose = require('mongoose');


const followersAndFollowingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  followers: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  following: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, 

// {
//     toJSON: {
//         transform: (document, returnedObject, options) => {
//                     returnedObject.id = returnedObject._id
//                     delete returnedObject._id
//                     delete returnedObject.__v
//         }
//     }
// },

{ timestamps: true });

followersAndFollowingSchema.methods.toJSON = function() {
  const followersAndFollowing = this;
  const followersAndFollowingObject = followersAndFollowing.toObject();

  followersAndFollowingObject.id = followersAndFollowingObject._id
  delete followersAndFollowingObject._id
  delete followersAndFollowingObject.__v
  return followersAndFollowingObject

}

const FollowersAndFollowings = mongoose.model("FollowersAndFollowings", followersAndFollowingSchema);
module.exports = FollowersAndFollowings;