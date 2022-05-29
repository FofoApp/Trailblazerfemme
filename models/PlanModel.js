const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    price: {type: Number, required: true }
}, { timestamps: true });

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;