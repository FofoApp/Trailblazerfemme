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


const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

module.exports = JobApplication;