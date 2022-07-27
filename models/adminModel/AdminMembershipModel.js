const mongoose = require('mongoose');


const membershipSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    benefits: { type: [String], default: [] },
    description: { type: String, required: true },
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

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;