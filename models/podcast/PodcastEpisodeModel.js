const mongoose = require('mongoose');

const podcastEpisodeSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    episode: { type: String, required: true, unique: true },
    topic: { type: String, required: true },
    podcastImage: { type: String, required: true },
    podcastLink: { type: String, required: true  },
    cloudinaryImagePublicId: { type: String, required: true },
    cloudinaryPodcastPublicId: { type: String, required: true },
    podcastId: {type: mongoose.Schema.Types.ObjectId, ref: 'Podcast' },
});

const PodcastEpisode = mongoose.model('PodcastEpisode', podcastEpisodeSchema);

module.exports = PodcastEpisode;