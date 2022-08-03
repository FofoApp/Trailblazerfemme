const mongoose = require('mongoose');


const communityCommentsSchema = new mongoose.Schema({
    UserId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
    Comment: { type: String, required: true },
    communityId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Community"},
    
}, 

{ timestamps: true });

communityCommentsSchema.methods.toJSON = function() {
    const communityComments = this;
    const communityCommentsObject = communityComments.toObject();

    communityCommentsObject.id = communityCommentsObject._id
    delete communityCommentsObject._id
    delete communityCommentsObject.__v
    return communityCommentsObject
}


const CommunityComments = mongoose.model('CommunityComments', communityCommentsSchema);

module.exports = CommunityComments;