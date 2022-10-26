const mongoose = require('mongoose');


const blogCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
}, 

{ timestamps: true });

blogCategorySchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};


const BlogCategory = mongoose.model('BlogCategory', blogCategorySchema);

module.exports = BlogCategory;