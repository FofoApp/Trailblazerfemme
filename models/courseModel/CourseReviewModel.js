const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const { ObjectId } = mongoose.Schema;

const courseReviewSchema = new mongoose.Schema({
    courseId: { type: ObjectId, ref: "Book", required: true },
    reviewdBy: { type: ObjectId, ref: "User", required: true },
    fullname: { type: String, trim: true,  required: true },
    rating: { type: Number, default: 0, required: true },
    comment: { type: String, trim: true,  required: true },

}, { timestamps: true });

courseReviewSchema.options.toJSON = {
    // virtuals: true,
    transform: function(doc, ret, options) {
       
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};


courseReviewSchema.plugin(mongoosePaginate);
const CourseReview  = mongoose.model('CourseReview', courseReviewSchema);

module.exports = CourseReview;