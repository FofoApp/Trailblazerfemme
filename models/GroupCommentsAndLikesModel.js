const mongoose = require('mongoose');

const groupCommentAndLikesSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    groupLikes: { type: Array, default: [] },
    groupComments: { type: Array, default: [] },
    
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



const GroupCommentsAndLikes = mongoose.model("GroupCommentsAndLikes", groupCommentAndLikesSchema);
module.exports = GroupCommentsAndLikes;