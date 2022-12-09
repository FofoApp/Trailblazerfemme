const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    message: { type: String, required: true },
    sentBy: {type: mongoose.Schema.objectId, ref: "users"},
    seenBy: [{ 
        user: {type: mongoose.Schema.objectId, ref: "User"}, 
        seen: { type: Boolean }
    }],
    numberOfMessages: { type: Number },
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },

   
}, { timestamps: true })

const Message = mongoose.model('Message', MessageSchema)

module.exports = Message