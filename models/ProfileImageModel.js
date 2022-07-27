const mongoose = require('mongoose');

const profileImageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref:"User", required: true  },
 
    profileImageCloudinaryPublicId: { type: String  },
    profileImage: { type: String },

    post: { type: Array },
    
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

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

const Profile = mongoose.model('Profile', profileImageSchema);

module.exports = Profile;