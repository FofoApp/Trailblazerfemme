const mongoose = require('mongoose');

const jobCategorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String },
    description: { type: String }
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

jobCategorySchema.methods.toJSON = function() {
    const jobCategory = this;
    const jobCategoryObject = jobCategory.toObject();

    jobCategoryObject.id = jobCategoryObject._id
    delete jobCategoryObject._id
    delete jobCategoryObject.__v
    return jobCategoryObject
}

const JobCategory = mongoose.model('JobCategory', jobCategorySchema);

module.exports = JobCategory;