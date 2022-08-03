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

{ timestamps: true });


communitySchema.methods.toJSON = function() {
    const community = this;
    const communityObject = community.toObject();

    communityObject.id = communityObject._id
    delete communityObject._id
    delete communityObject.__v

    return communityObject

}

const Community = mongoose.model('Community', communitySchema);

module.exports = Community;