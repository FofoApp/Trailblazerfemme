const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema({
    rateCount: { type: Number, required: true },
    rateComment: { type: String, required: true},
    ratedBy: { type: ObjectId, ref: 'User', required: true },
    ratedProduct: { type: ObjectId, ref: 'Product' }
}, { timestamps: true });


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;