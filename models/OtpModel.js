
const mongoose = require('mongoose');

const otpShema = new mongoose.Schema({
    userId: { type: String, required: true },
    phonenumber: {type: String, required: true },
    otp: { type: Number, required: true },
    createdDate: { type: Date, default: Date.now, index: { expires: 300 }}
//GET DELETED AFTER FIVE MINUTES
}, 

{
    toJSON: {
        transform: (document, returnedObject, options) => {
                    returnedObject.id = returnedObject._id
                    delete returnedObject._id
                    delete returnedObject.__v
        }
    }
},

{ timestamps: true });

const Otp = mongoose.model('Otp', otpShema);

module.exports = Otp;