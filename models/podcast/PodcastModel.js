const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    podcastImage: { type: String, required: true },
    podcastCloudinaryPublicId: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
    podcastCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'PodcastCategory' },
    hosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    createdBy: { type: String, trim: true, default: "" },

    views: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: { type: String, trim: true, default: "" },
    reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    episodes: [{type: mongoose.Schema.Types.ObjectId, ref: 'PodcastEpisode' }],
    popular: [{type: mongoose.Schema.Types.ObjectId, ref: 'PodcastCategory' }],
    recentlyPlayed: [{type: mongoose.Schema.Types.ObjectId, ref: 'Podcast' }],
    popularPodcast: [{ type: mongoose.Schema.Types.ObjectId, ref: "PopularPodcast" } ],
}, 


{ timestamps: true });


// podcastSchema.index({ name: "text" });

podcastSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.podcastCloudinaryPublicId
        return ret;
     }
};

const Podcast = mongoose.model('Podcast', podcastSchema);

module.exports = Podcast;