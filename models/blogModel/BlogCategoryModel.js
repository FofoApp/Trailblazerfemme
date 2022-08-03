const mongoose = require('mongoose');


const blogCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
}, 

{ timestamps: true });

blogCategorySchema.set('toJSON', {
    transform: function(doc, ret, options){
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
})

// blogCategorySchema.methods.toJSON = function() {
//     const blogCategory = this;
//     const blogCategoryObject = blogCategory.toObject();

//     blogCategoryObject.id = blogCategoryObject._id
//     delete blogCategoryObject._id
//     delete blogCategoryObject.__v

// }

const BlogCategory = mongoose.model('BlogCategory', blogCategorySchema);

module.exports = BlogCategory;