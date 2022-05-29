const mongoose = require('mongoose');

const jobCategorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String },
    description: { type: String }
}, { timestamps: true });

const JobCategory = mongoose.model('JobCategory', jobCategorySchema);

module.exports = JobCategory;