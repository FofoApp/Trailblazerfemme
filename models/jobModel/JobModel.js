const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company_name: { type: String, required: true },
    image: { type: [String], default: [] },
    description: { type: String, required: true },
    position: { type: [String], required: true },
    qualification: { type: [String], required: true },
    categoryId: [{type: mongoose.Schema.Types.ObjectId, ref: 'JobCategory'}],
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;