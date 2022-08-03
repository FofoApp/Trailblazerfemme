const mongoose = require('mongoose');

const groupCommentAndLikesSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    groupLikes: { type: Array, default: [] },
    groupComments: { type: Array, default: [] },
    
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

groupCommentAndLikeSchema.methods.toJSON = function() {
    const groupCommentAndLike = this;
    const groupCommentAndLikeObject = groupCommentAndLike.toObject();

    groupCommentAndLikeObject.id = groupCommentAndLikeObject._id
    delete groupCommentAndLikeObject._id
    delete groupCommentAndLikeObject.__v
    return groupCommentAndLikeObject

}

const GroupCommentsAndLikes = mongoose.model("GroupCommentsAndLikes", groupCommentAndLikesSchema);
module.exports = GroupCommentsAndLikes;