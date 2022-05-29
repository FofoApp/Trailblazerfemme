const mongoose = require('mongoose');

const blogLikeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    BlogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
}, { timestamps: true });


const BlogLikes = mongoose.model('BlogLikes', blogLikeSchema);

module.exports = BlogLikes;