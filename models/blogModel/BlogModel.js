const mongoose = require('mongoose');


const blogModelSchema = new mongoose.Schema({
 title: { type: String, required: true, unique: true  },
 description:{ type: String, required: true },
 blogImagePath: { type: String, required: true },
 blogImageCloudinaryPublicId: { type: String, required: true },

 comments: [
    {
        comment: String,
        commentDate: { type: Date, default: Date.now() },
        commentedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        blogId: {type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
        // userProfile: {type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    },
],

 createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
 blogCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory', required: true},
 blogComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogComment' }],
 blogLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
 blogviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//  toJSON: { virtuals: true },
//  toObject: { virtuals: true }
}, 


{ timestamps: true });


blogModelSchema.virtual('likes').get(function() {
    
    return this.blogLikes;
}).set(function(value) {
    var like = value;
    
    console.log(like)
})


blogModelSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options){
        if(ret.comments) {
            ret.comments.map((comment) => {
                comment.id = comment._id;
                delete comment._id;
                return comment;
            })
        }
        ret.blogLikes = ret.blogLikes.length;
        ret.blogviews = ret.blogviews.length;
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;

        return ret;
    }
})



// blogModelSchema.virtual('id')
//                 .get(function(){
//                     this._id.toHexString();
//                     delete this._id;
//                     return this;
//                 });

// blogModelSchema.set('toJSON', {
//     virtuals: true
// })


// blogModelSchema.methods.toJSON = function() {
//     const blog = this;
//     const blogObject = blog.toObject();

//     blogObject.id = blogObject._id

//     delete blogObject._id
//     delete blogObject.__v


//     blogObject.createdBy.id = blogObject.createdBy._id
//     delete blogObject.createdBy._id

//     blogObject.createdBy.profileId.id = blogObject.createdBy.profileId._id
//     delete blogObject.createdBy.profileId._id
//     console.log(blogObject.createdBy)


//     if(blogObject.comments) {
//     blogObject.comments.map((comment) => {
//         comment.id = comment._id
//         delete comment._id

//         comment.commentedBy.id = comment.commentedBy._id
//         delete comment.commentedBy._id

//         comment.commentedBy.profileId.id = comment.commentedBy.profileId._id
//         delete  comment.commentedBy.profileId._id

//         return comment;
//     })


// }

//         return blogObject;

// }

const Blog = mongoose.model('Blog', blogModelSchema);

module.exports = Blog;