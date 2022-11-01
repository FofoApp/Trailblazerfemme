const mongoose = require('mongoose');


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


blogModelSchema.virtual('likes').get(function() {
    
    return this.blogLikes;
}).set(function(value) {
    var like = value;
});

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
        
        ret.blogLikes = ret.blogLikes.length;
        ret.blogviews = ret.blogviews.length;
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;

        return ret;
    }
};

const Blog = mongoose.model('Blog', blogModelSchema);

module.exports = Blog;