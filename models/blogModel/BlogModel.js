const mongoose = require('mongoose');


const blogModelSchema = new mongoose.Schema({
 title: { type: String, required: true, unique: true  },
 short_description:{ type: String },
 description:{ type: String, required: true },
 image: { type:String, default: null },
 created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
 blogCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory' },
 blogComment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogComment' }],
 blogLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogLikes' }],
 blogviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

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


const Blog = mongoose.model('Blog', blogModelSchema);

module.exports = Blog;