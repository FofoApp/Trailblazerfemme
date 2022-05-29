const mongoose = require('mongoose');


const communityLikesSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
    communityId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Community"},
    
}, { timestamps: true });


const CommunityLikes = mongoose.model('CommunityLikes', communityLikesSchema);

module.exports = CommunityLikes;