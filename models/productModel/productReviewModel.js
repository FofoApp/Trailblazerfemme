const mongoose = require('mongoose');
const mongoose_paginate = require('mongoose-paginate-v2');
const ObjectId = mongoose.Schema.Types.ObjectId;


const reviewSchema = new mongoose.Schema({
    rating: { type: Number, required: true, },
    comment: { type: String, required: true},
    ratedBy: { type: ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    product: { type: ObjectId, ref: 'Product' }
}, { timestamps: true });


reviewSchema.options.toJSON = {
    transform: function(doc, ret, option) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.updatedAt

        return ret
    }
}


reviewSchema.plugin(mongoose_paginate)

const ProductReview = mongoose.model('ProductReview', reviewSchema);

module.exports = ProductReview;