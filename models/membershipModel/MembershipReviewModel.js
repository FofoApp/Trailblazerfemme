const mongoose = require('mongoose');
const mongosePaginate = require('mongoose-paginate-v2');




const membershipReviewSchema = new mongoose.Schema({
    MembershipId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership", required: true },
    reviewdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullname: { type: String, trim: true,  required: true },
    rating: { type: Number, default: 0, required: true },
    comment: { type: String, trim: true,  required: true },

}, { timestamps: true });

membershipReviewSchema.options.toJSON = {
    // virtuals: true,
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

membershipReviewSchema.plugin(mongosePaginate);

const MembershipReview  = mongoose.model('MembershipReview', membershipReviewSchema);

module.exports = MembershipReview;