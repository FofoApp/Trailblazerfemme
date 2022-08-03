const mongoose = require('mongoose');


const communityLikesSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
    communityId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Community"},
    
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


communityLikesSchema.methods.toJSON = function() {
    const communityLikes = this;
    const communityLikesObject = communityLikes.toObject();

    communityLikesObject.id = communityLikesObject._id
    delete communityLikesObject._id
    delete communityLikesObject.__v
    return communityLikesObject
}


const CommunityLikes = mongoose.model('CommunityLikes', communityLikesSchema);

module.exports = CommunityLikes;