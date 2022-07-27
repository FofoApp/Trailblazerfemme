const mongoose = require('mongoose');

const jobCategorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String },
    description: { type: String }
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

const JobCategory = mongoose.model('JobCategory', jobCategorySchema);

module.exports = JobCategory;