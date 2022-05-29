const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const RefreshAccessTokenSchema = new Schema({
      userId: { type: Schema.Types.ObjectId, required: true },
      accessToken: { type: String, required: true },
      refreshToken: { type: String, required: true },
      created_At: { type: Date, default: Date.now, expires: 30 * 86400 },
      updated_At: { type: Date, default: Date.now }
      
});

const RefreshAccessToken = mongoose.model('RefreshAccessToken', RefreshAccessTokenSchema);
module.exports = RefreshAccessToken;