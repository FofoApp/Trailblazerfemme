const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const RefreshAccessTokenSchema = new Schema({
      userId: { type: Schema.Types.ObjectId, required: true },
      accessToken: { type: String, required: true },
      refreshToken: { type: String, required: true },
      created_At: { type: Date, default: Date.now, expires: 30 * 86400 },
      updated_At: { type: Date, default: Date.now }
      
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

const RefreshAccessToken = mongoose.model('RefreshAccessToken', RefreshAccessTokenSchema);
module.exports = RefreshAccessToken;