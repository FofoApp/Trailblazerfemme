const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: { type: String,  required: true },
    price: {type: Number, required: true }
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

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;