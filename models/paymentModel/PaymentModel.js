const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    membershipName: { type: String, required: true },
    amount: { type: String, required: true },
    chargeId: { type: String, default: null },
    paymentDate: { type: Date},
    nextPaymentDueDate: { type: Date},
    isPaid: { type: Boolean, default: false },
    paymentType1: { type: Number },
    paymentType2: { type: String },
    membershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);