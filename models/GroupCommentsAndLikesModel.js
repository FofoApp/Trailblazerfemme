const mongoose = require('mongoose');

const groupCommentAndLikesSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    groupLikes: { type: Array, default: [] },
    groupComments: { type: Array, default: [] },
    
}, { timestamps: true });



const GroupCommentsAndLikes = mongoose.model("GroupCommentsAndLikes", groupCommentAndLikesSchema);
module.exports = GroupCommentsAndLikes;