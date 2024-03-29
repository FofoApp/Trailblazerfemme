const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupName: { type: String, required: true },
    groupImagePath: { type: String, required: true },
    description: { type: String, required: true },
    dateJoined: { type: Date, default: Date.now },
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

groupSchema.methods.toJSON = function() {
    const group = this;
    const groupObject = group.toObject();

    groupObject.id = groupObject._id
    delete groupObject._id
    delete groupObject.__v
    return groupObject
}

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;