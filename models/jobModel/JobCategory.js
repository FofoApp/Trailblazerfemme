const mongoose = require('mongoose');

const jobCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
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

jobCategorySchema.options.toJSON = {
    // virtuals: true,
    transform: function(doc, ret, options){
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};

const JobCategory = mongoose.model('JobCategory', jobCategorySchema);

module.exports = JobCategory;