const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    price: { type: String, required: true },
    ratings: { type: Number, default: 0 },
    store: { type: String, default: null },
    cloudinaryPublicId: { type: String, required: true },
    bookImage: { type: String, required: true },
    bookCategoryId:{ type: ObjectId, ref: "BookCategory"},


    recentSearch: [{ type: ObjectId, ref: "Book" }],    
    readers: [{ type:ObjectId, ref: "Book"}],
    createdBy: { type: ObjectId, ref: "User"},
    trendingId: [{ type: ObjectId, ref: 'TrendingBook'}],

}, { timestamps: true });


const Book  = mongoose.model('Book', bookSchema);

module.exports = Book;