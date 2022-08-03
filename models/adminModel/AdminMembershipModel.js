const mongoose = require('mongoose');


const membershipSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    benefits: { type: [String], default: [] },
    description: { type: String, required: true },
}, 

{ timestamps: true });

membershipSchema.methods.toJSON = function() {
    const membership = this;
    const membershipObject = membership.toObject();

    membershipObject.id = membershipObject._id
    delete membershipObject._id
    delete membershipObject.__v
    return membershipObject
}

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;