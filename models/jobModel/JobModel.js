const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company_name: { type: String, required: true },
    image: { type: [String], default: [] },
    description: { type: String, required: true },
    jobType: { type: String, required: true },
    jobField: { type: String, required: true },

    jobImagePath: { type: String, required: true },
    jobImageCloudinaryPublicId: { type: String, required: true },

    position: { type: [String], required: true },
    qualification: { type: [String], required: true },
    categoryId: [{type: mongoose.Schema.Types.ObjectId, ref: 'JobCategory'}],

    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},

    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    
}, 

// {
//     toJSON: {
//         transform: (document, returnedObject, options) => {
//                     returnedObject.id = returnedObject._id
//                     delete returnedObject._id
//                     delete returnedObject.__v
//         }
//     }
// },

{ timestamps: true });


jobSchema.methods.toJSON = function() {
    const job = this;
    const jobObject = job.toObject();

    jobObject.id = jobObject._id
    delete jobObject._id
    delete jobObject.__v
    return jobObject
}

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;