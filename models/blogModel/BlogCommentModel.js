const mongoose = require('mongoose');

const blogCommentSchema = new mongoose.Schema({
    // comment: { type: String, required: true },
    // blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [
        {
            text: String,
            createdDate: { type: Date, default: Date.now },
            commentedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
        },
    ],
}, 

{ timestamps: true });

blogCommentSchema.methods.toJSON = function() {
    const blogComment = this;
    const blogCommentObject = blogComment.toObject();

    blogCommentObject.id = blogCommentObject._id
    delete blogCommentObject._id
    delete blogCommentObject.__v
    return blogCommentObject
}

const BlogComment = mongoose.model('BlogComment', blogCommentSchema);

module.exports = BlogComment;