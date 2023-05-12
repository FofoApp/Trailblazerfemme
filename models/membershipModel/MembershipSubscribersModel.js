const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const membershipSubscriberSchema = new mongoose.Schema({
    // membershipType: Free | Gold | Premium e.t.c
    membershipType: { type: String, required: true },
    receipt_email: { type: String },
    membershipId: {type: mongoose.Schema.Types.ObjectId, ref: "Membership"},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    isActive: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    // mode: payment mode yearly | monthly
    mode: { type: String, required: true },
    amount: { type: String, required: true },
    
    subscription_end_date: { type: Date, required: true },
    subscription_start_date: { type: Date, required: true  },
    days_between_next_payment: { type: Number, default: 0 },

    subscriptionId: { type: String, required: true },
    amount: { type: String, required: true },
    paymentIntentId: { type: String, required: true }
    
}, { timestamps: true });


membershipSubscriberSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

membershipSubscriberSchema.plugin(mongoosePaginate);

const MembershipSubscriber = mongoose.model('MembershipSubscriber', membershipSubscriberSchema);

module.exports = MembershipSubscriber;