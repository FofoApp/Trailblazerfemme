const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const blogCommentSchema = new mongoose.Schema({
    comment: { type: String, required: true },
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
    createdDate: { type: Date, default: Date.now },
    commentedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // comments: [
    //     {
    //         comment: String,
    //         createdDate: { type: Date, default: Date.now },
    //         commentedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    //     },
    // ],
}, 

{ timestamps: true });


blogCommentSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

blogCommentSchema.plugin(mongoosePaginate);

const BlogComment = mongoose.model('BlogComment', blogCommentSchema);

module.exports = BlogComment;