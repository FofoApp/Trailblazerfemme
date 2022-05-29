const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    imagePath: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: String, required: true },
    ratings: { type: Number },
    store: { type: String, default: null },
    cloudinaryPublicId: { type: String, default: null },
    recentSearch: { type: [String], default: [] },

    bookCategoryId: [{ type: mongoose.Schema.Types.ObjectId, ref: "BookCategory"}],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    whoRead: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"},
],
    trendingId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TrendingBook'}],

}, { timestamps: true });


const Book  = mongoose.model('Book', bookSchema);

module.exports = Book;