const mongoose = require('mongoose');


const blogCategorySchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    slug: { type: String },
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


const BlogCategory = mongoose.model('BlogCategory', blogCategorySchema);

module.exports = BlogCategory;