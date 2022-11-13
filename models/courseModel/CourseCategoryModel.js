const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');


const courseCategorySchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true},
    slug: { type: String },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
},

{ timestamps: true });

courseCategorySchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

courseCategorySchema.plugin(mongoosePaginate);

const CourseCategory = mongoose.model('CourseCategory', courseCategorySchema);

module.exports = CourseCategory;