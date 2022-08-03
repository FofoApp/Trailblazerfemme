const mongoose = require('mongoose');

const trendingSchema = new mongoose.Schema({
    userId: {  type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookId: {  type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
}, { timestamps: true });


trendingSchema.methods.toJSON = function() {
    const trending = this;
    const trendingObject = trending.toObject();

    trendingObject.id = trendingObject._id
    delete trendingObject._id
    delete trendingObject.__v
    return trendingObject
}


const TrendingBook = mongoose.model('TrendingBook', trendingSchema);
module.exports = TrendingBook;