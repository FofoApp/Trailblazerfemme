const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    topic: { type: String, required: true },
    podcastImage: { type: String, default: null },
    podcastCloudinaryPublicId: { type: String, default: null },
    about: { type: String },
    tags: { type: [String ], default: [] },
    popularPodcast: [{ type: mongoose.Schema.Types.ObjectId, ref: "PopularPodcast" } ],
    podcastCategoryId: {type: mongoose.Schema.Types.ObjectId, ref: 'PodcastCategory' },

    // podcastHostId: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    views: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hosts: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    episodes: [{type: mongoose.Schema.Types.ObjectId, ref: 'PodcastEpisode' }],
    popular: [{type: mongoose.Schema.Types.ObjectId, ref: 'PodcastCategory' }],
    recentlyPlayed: [{type: mongoose.Schema.Types.ObjectId, ref: 'Podcast' }],
}, 


{ timestamps: true });


podcastSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options){
        ret.id = ret._id
        ret.views = ret.views.length;
        // ret.suggestedPodcast.id = ret.suggestedPodcast._id;
       
        delete ret._id
        delete ret.__v
        delete ret.suggestedPodcast._id;
        delete ret.podcastCloudinaryPublicId
        console.log(ret)
        return ret;
        
    }
})





const Podcast = mongoose.model('Podcast', podcastSchema);

module.exports = Podcast;