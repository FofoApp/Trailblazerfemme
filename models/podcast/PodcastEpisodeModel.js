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

const PodcastEpisode = mongoose.model('PodcastEpisode', podcastEpisodeSchema);

module.exports = PodcastEpisode;