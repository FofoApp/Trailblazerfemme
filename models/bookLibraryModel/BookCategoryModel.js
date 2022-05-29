const mongoose = require('mongoose');

const bookCategorySchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    iconName: { type: String, default: null }
}, { timestamps: true });


const BookCategory = mongoose.model('BookCategory', bookCategorySchema);
module.exports = BookCategory;