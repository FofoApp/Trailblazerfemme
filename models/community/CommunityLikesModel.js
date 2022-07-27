const mongoose = require('mongoose');


const communityLikesSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
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


const CommunityLikes = mongoose.model('CommunityLikes', communityLikesSchema);

module.exports = CommunityLikes;