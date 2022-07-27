const mongoose = require('mongoose');


const blogModelSchema = new mongoose.Schema({
 title: { type: String, required: true, unique: true  },
 description:{ type: String, required: true },
 blogImagePath: { type: String, required: true },
 blogImageCloudinaryPublicId: { type: String, required: true },

 comments: [
    {
        comment: String,
        createdDate: { type: Date, default: Date.now },
        commentedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userProfile: {type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    },
],

 createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
 blogCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory', required: true},
//  blogComment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogComment' }],
 blogLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogLikes' }],
 blogviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

}, 

{
    toJSON: {
        transform: (document, returnedObject, options) => {
                
                    returnedObject.id = returnedObject._id
                    delete returnedObject._id
                    // delete returnedObject.createdBy
                    delete returnedObject.__v

                    if(returnedObject.comments) {
                        returnedObject.comments.map((comment) => {
                            comment.id = comment._id
                            delete comment._id
                        })
                    }

        }
    }
},

{ timestamps: true });


const Blog = mongoose.model('Blog', blogModelSchema);

module.exports = Blog;