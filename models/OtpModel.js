
const mongoose = require('mongoose');

const otpShema = new mongoose.Schema({
    userId: { type: String, required: true },
    phonenumber: {type: String, required: true },
    otp: { type: Number, required: true },
    createdDate: { type: Date, default: Date.now, index: { expires: 300 }}
//GET DELETED AFTER FIVE MINUTES
}, { timestamps: true })

const Otp = mongoose.model('Otp', otpShema);

module.exports = Otp;