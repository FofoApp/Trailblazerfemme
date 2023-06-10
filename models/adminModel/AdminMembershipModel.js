const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');


const membershipSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    pricePerYear: { type: Number, default: 0 },
    pricePerMonth: { type: Number, default: 0 },
    accessType: [{ type: String, required: true}],
    benefits: {type: String, trim: true, default: "" },
    perks: [{ type: String, trim: true, default: [] } ],
    description: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reviewsIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "MembershipReview" }],

},  { timestamps: true });

membershipSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

membershipSchema.plugin(mongoosePaginate);

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;