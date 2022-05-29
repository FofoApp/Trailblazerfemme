const mongoose = require('mongoose');


const blogCategorySchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    slug: { type: String },
}, { timestamps: true });


const BlogCategory = mongoose.model('BlogCategory', blogCategorySchema);

module.exports = BlogCategory;