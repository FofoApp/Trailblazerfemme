
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    phonenumber: {type: String, required: true },
    otp: { type: Number, required: true },
    createdDate: { type: Date, default: Date.now, index: { expires: 300 }}
//GET DELETED AFTER FIVE MINUTES
}, 


{ timestamps: true });

otpSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;