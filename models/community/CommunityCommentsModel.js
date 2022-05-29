const mongoose = require('mongoose');


const communityCommentsSchema = new mongoose.Schema({
    UserId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
    Comment: { type: String, required: true },
    communityId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Community"},
    
}, { timestamps: true });


const CommunityComments = mongoose.model('CommunityComments', communityCommentsSchema);

module.exports = CommunityComments;