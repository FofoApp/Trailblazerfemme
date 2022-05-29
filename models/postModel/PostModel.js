const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    postImage: { type: String, default: null },
    postCloudinaryPublicId: { type: String, default: null },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community'},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    // likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    comments: [
        { 
            comment:  { type: String },
            created: { type: Date, default: Date.now },
            createdBy: {  type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        }
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;