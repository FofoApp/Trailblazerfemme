const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');


const podcastEpisodeSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    name: { type: String, default: "Episode" },
    duration: { type: String, required: true },
    episode: { type: String, required: true, unique: true },
    podcastImage: { type: String, required: true },
    podcastLink: { type: String, required: true  },
    cloudinaryImagePublicId: { type: String, required: true },
    cloudinaryPodcastPublicId: { type: String, required: true },
    podcastId: {type: mongoose.Schema.Types.ObjectId, ref: 'Podcast' },
}, 

{ timestamps: true });

podcastEpisodeSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.cloudinaryImagePublicId
        delete ret.podcastCloudinaryPublicId
        return ret;
     }
};

podcastEpisodeSchema.plugin(mongoosePaginate);
const PodcastEpisode = mongoose.model('PodcastEpisode', podcastEpisodeSchema);

module.exports = PodcastEpisode;