const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupName: { type: String, required: true },
    groupImagePath: { type: String, required: true },
    description: { type: String, required: true },
    dateJoined: { type: Date, default: Date.now },
}, { timestamps: true });



const Group = mongoose.model("Group", groupSchema);
module.exports = Group;