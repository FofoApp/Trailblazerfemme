const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const podcastReviewSchema = new mongoose.Schema({
    PodcastId: { type: ObjectId, ref: "Podcast", required: true },
    reviewdBy: { type: ObjectId, ref: "User", required: true },
    fullname: { type: String, trim: true,  required: true },
    rating: { type: Number, default: 0, required: true },
    comment: { type: String, trim: true,  required: true },

}, { timestamps: true });

podcastReviewSchema.options.toJSON = {
    // virtuals: true,
    transform: function(doc, ret, options) {
       
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};



const PodcastReview  = mongoose.model('PodcastReview', podcastReviewSchema);

module.exports = PodcastReview;