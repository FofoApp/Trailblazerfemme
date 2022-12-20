const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company_name: { type: String, required: true },
    image: { type: [String], default: [] },
    description: { type: String, required: true },
    jobType: { type: String, required: true },
    jobField: { type: String, required: true },

    adminAccess: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accessType: { type: String, default: 'Free' },

    jobImagePath: { type: String, required: true },
    jobImageCloudinaryPublicId: { type: String, required: true },

    jobImages: [{
        public_id: { type: String, required: true },
        image_url: { type: String, required: true },
     }],

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


jobSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;