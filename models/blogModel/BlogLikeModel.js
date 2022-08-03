const mongoose = require('mongoose');

const blogLikeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    BlogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
}, 

{ timestamps: true });

blogLikeSchema.methods.toJSON = function() {
    const blogLike = this;
    const blogLikeObject = blogLike.toObject();

    blogLikeObject.id = blogLikeObject._id
    delete blogLikeObject._id
    delete blogLikeObject.__v
    return blogLikeObject
}

const BlogLikes = mongoose.model('BlogLikes', blogLikeSchema);

module.exports = BlogLikes;