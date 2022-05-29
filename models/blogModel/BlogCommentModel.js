const mongoose = require('mongoose');

const blogCommentSchema = new mongoose.Schema({
    comment: { type: String, required: true },
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const BlogComment = mongoose.model('BlogComment', blogCommentSchema);

module.exports = BlogComment;