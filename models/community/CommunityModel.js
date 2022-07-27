const mongoose = require('mongoose');


const communitySchema = new mongoose.Schema({    
    title: { type: String },
    short_description: { type: String },
    description: {type: String },
    image: { type:String, default:null },
    communityMembershipPlan: { type: String, default: "Free" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],

    moderators: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    communityComments:{ type: Array, default: []},    
    communityLikes: {type: Array, default: [] }
    
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


const Community = mongoose.model('Community', communitySchema);

module.exports = Community;