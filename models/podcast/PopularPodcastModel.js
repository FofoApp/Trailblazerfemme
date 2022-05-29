const mongoose = require('mongoose');

const popularPodcastSchema = new mongoose.Schema({
    podcastId: { type: mongoose.Schema.Types.ObjectId, ref: "Podcast" },
    userWhoListenedToPodcast: { type: mongoose.Schema.Types.ObjectId }
}, {timestamps: true });


const PopularPodcast = mongoose.model('PopularPodcast', popularPodcastSchema);

module.exports = PopularPodcast;