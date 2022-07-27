const mongoose = require('mongoose');

const blogCommentSchema = new mongoose.Schema({
    comment: { type: String, required: true },
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, 

{
    toJSON: {
        transform: (document, returnedObject, options) => {
                    returnedObject.id = returnedObject._id
                    delete returnedObject._id
                    delete returnedObject.__v
        }
    }
},

{ timestamps: true });

const BlogComment = mongoose.model('BlogComment', blogCommentSchema);

module.exports = BlogComment;