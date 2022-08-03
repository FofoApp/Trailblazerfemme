const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    postImage: { type: String, default: null },
    postCloudinaryPublicId: { type: String, default: null },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community'},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    // likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    comments: [
        { 
            comment:  { type: String },
            created: { type: Date, default: Date.now },
            createdBy: {  type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        }
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, 

// {
//     toJSON: {
//         transform: (document, returnedObject, options) => {
//                     returnedObject.id = returnedObject._id
//                     delete returnedObject._id
//                     delete returnedObject.__v
//         }
//     }
// },

{ timestamps: true });

postSchema.methods.toJSON = function() {
    const post = this;
    const postObject = post.toObject();

    postObject.id = postObject._id
    delete postObject._id
    delete postObject.__v
    return postObject
}

const Post = mongoose.model('Post', postSchema);

module.exports = Post;