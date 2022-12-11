const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const blogModelSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true  },
    description:{ type: String, required: true },
    blogImage: { type: String, required: true },
    blogImageCloudinaryPublicId: { type: String, required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    blogCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory', required: true},
    blogComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogComment' }],
    blogLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blogviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

 comments: [
    {
        comment: { type: String, required: true },
        commentDate: { type: Date, default: Date.now() },

        commentedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        blogId: {type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
        // userProfile: {type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    },
],


}, 


{ timestamps: true });

blogModelSchema.virtual('blog_comment_count', {
    ref: 'BlogComment',
    localField: '_id',
    foreignField: 'blogId',
    count: true
})


// blogModelSchema.virtual('likes').get(function() {
    
//     return this.blogLikes;
// }).set(function(value) {
//     var like = value;
// });



// blogModelSchema.virtual('articleCount').get(function () {
//     return this.blogComments.length;
// });



blogModelSchema.options.toJSON = {
    // virtuals: true,
    transform: function(doc, ret, options){
        if(ret.comments) {
            ret.comments.map((comment) => {
                comment.id = comment._id;
                delete comment._id;
                return comment;
            })
        }

    

        ret.blogComments = ret.blogComments.length || 0;
        ret.blogLikes = ret.blogLikes.length ? ret.blogLikes.length : 0;
        ret.blogviews = ret.blogviews.length ? ret.blogviews.length : 0;
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;

        console.log(ret.blogComments)

        return ret;
    }
};


blogModelSchema.plugin(mongoosePaginate);
const Blog = mongoose.model('Blog', blogModelSchema);

module.exports = Blog;