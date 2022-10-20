const mongoose = require('mongoose');


const membershipSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    benefits: { type: String, default: "", trim: true, required: true },
    description: { type: String, required: true },

},  { timestamps: true });

membershipSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;