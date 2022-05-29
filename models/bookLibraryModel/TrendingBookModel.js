const mongoose = require('mongoose');

const trendingSchema = new mongoose.Schema({
    userId: {  type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookId: {  type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
}, { timestamps: true });


const TrendingBook = mongoose.model('TrendingBook', trendingSchema);
module.exports = TrendingBook;