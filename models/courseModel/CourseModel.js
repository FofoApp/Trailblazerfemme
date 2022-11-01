const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    accessType: { type: String, required: true },
    duration: { type: String, required: true },
    course_image: { type: [String], default: [] },
    courseLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    createdBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    new_joined: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    categoryId: {type: mongoose.Schema.Types.ObjectId, ref: 'JobCategory'},
    reviewIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "CourseReview"}],
    
}, { timestamps: true });


courseSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

courseSchema.plugin(mongoosePaginate);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;