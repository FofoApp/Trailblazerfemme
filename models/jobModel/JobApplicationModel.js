const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({

    fullname: { type: String, required: true },
    email: { type: String, required: true },
    phonenumber: { type: String, required: true },
    availability: { type: String, required: true },

    resumeePublicId: { type: String, default: null },
    resumee: { type: String, default: null },

    coverLetterPublicId: { type: String, default: null },
    coverLetter: { type: String, default: null },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    
});


const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

module.exports = JobApplication;