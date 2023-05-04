const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({

    name: { type: String, required: true },
    company_name: { type: String, required: true },

    description: { type: String, required: true },
    link: { type: String, required: true },
    authorName: { type: String, required: true },

    authorImages: [{
        public_id: { type: String, required: true },
        secure_url: { type: String, required: true },
     }],
    
    jobType: { type: String, required: true },
    jobField: { type: String, required: true },

    adminAccess: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accessType: { type: String, default: 'Free' },

    jobImages: [{
        public_id: { type: String, required: true },
        secure_url: { type: String, required: true },
     }],

    position: { type: [String], default: [] },
    qualification: { type: [String], default: [] },
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