const mongoose = require('mongoose');

const blogLikeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    BlogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
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


const BlogLikes = mongoose.model('BlogLikes', blogLikeSchema);

module.exports = BlogLikes;