const mongoose = require('mongoose');

const popularPodcastSchema = new mongoose.Schema({
    podcastId: { type: mongoose.Schema.Types.ObjectId, ref: "Podcast" },
    userWhoListenedToPodcast: [{ type: mongoose.Schema.Types.ObjectId, ref:'User' }]
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

popularPodcastSchema.methods.toJSON = function() {
    const popularPodcast = this;
    const popularPodcastObject = popularPodcast.toObject();

    popularPodcastObject.id = popularPodcastObject._id
    delete popularPodcastObject._id
    delete popularPodcastObject.__v
    return popularPodcastObject
}

const PopularPodcast = mongoose.model('PopularPodcast', popularPodcastSchema);

module.exports = PopularPodcast;