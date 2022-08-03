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
    
}, 

// {
//     toJSON: {
//         transform: (document, returnedObject, options) => {
//                     returnedObject.id = returnedObject._id
//                     delete returnedObject._id
//                     delete returnedObject.__v
//         }
//     }
// },


{ timestamps: true });


paymentSchema.methods.toJSON = function() {
    const payment = this;
    const paymentObject = payment.toObject();

    paymentObject.id = paymentObject._id
    delete paymentObject._id
    delete paymentObject.__v
    return paymentObject
}

module.exports = mongoose.model('Payment', paymentSchema);