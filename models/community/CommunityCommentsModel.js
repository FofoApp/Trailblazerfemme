const mongoose = require('mongoose');


const communityCommentsSchema = new mongoose.Schema({
    UserId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
    Comment: { type: String, required: true },
    communityId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Community"},
    
}, 

{
    toJSON: {
        transform: (document, returnedObject, options) => {
                    returnedObject.id = returnedObject._id
                    delete returnedObject._id
                    delete returnedObject.__v
        }
    }
},

{ timestamps: true });


const CommunityComments = mongoose.model('CommunityComments', communityCommentsSchema);

module.exports = CommunityComments;