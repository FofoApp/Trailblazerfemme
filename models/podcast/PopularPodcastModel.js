const mongoose = require('mongoose');

const popularPodcastSchema = new mongoose.Schema({
    podcastId: { type: mongoose.Schema.Types.ObjectId, ref: "Podcast" },
    userWhoListenedToPodcast: { type: mongoose.Schema.Types.ObjectId }
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


const PopularPodcast = mongoose.model('PopularPodcast', popularPodcastSchema);

module.exports = PopularPodcast;