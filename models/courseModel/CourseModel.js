const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const courseSchema = new mongoose.Schema({

    name: { type: String, required: true },
    description: { type: String, required: true },
    accessType: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "CourseCategory"},
    duration: { type: String, required: true },

    courseImage: [{
        public_id: { type: String, required: true },
        image_url: { type: String, required: true },
     }],

     createdBy: [{
        fullname: { type: String, required: true },
        public_id: { type: String, required: true },
        image_url: { type: String, required: true },
    }],

    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    
    courseLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    new_joined: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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