const mongoose = require('mongoose');

const profileImageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref:"User", required: true  },
 
    profileImageCloudinaryPublicId: { type: String  },
    profileImage: { type: String },

    post: { type: Array },
    
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

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


profileImageSchema.set('toJSON', {
    // virtuals: true,
    transform: function(doc, ret, options){
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;

        return ret;
    }
})


const Profile = mongoose.model('Profile', profileImageSchema);

module.exports = Profile;