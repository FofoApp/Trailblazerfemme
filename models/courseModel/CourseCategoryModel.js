const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const jobCategorySchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true},
    slug: { type: String },
    description: { type: String }
},

{ timestamps: true });

jobCategorySchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

jobCategorySchema.plugin(mongoosePaginate);

const JobCategory = mongoose.model('JobCategory', jobCategorySchema);

module.exports = JobCategory;