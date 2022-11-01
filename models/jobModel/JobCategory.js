const mongoose = require('mongoose');

const jobCategorySchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true, unique: true },
    slug: { type: String },
    description: { type: String }
}, 


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