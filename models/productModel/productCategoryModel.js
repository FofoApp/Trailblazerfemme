const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    slug: {type: String }
}, { timestamps: true });


const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);

module.exports = ProductCategory;