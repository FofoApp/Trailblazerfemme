const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    podcastImage: { type: String, required: true },
    podcastCloudinaryPublicId: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
    podcastCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'PodcastCategory' },
    hosts: [{type: String, trim: true, required: true }],
    // hosts: { type: [String], trim: true, required: true },

    views: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: { type: [String ], default: [] },
    reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    episodes: [{type: mongoose.Schema.Types.ObjectId, ref: 'PodcastEpisode' }],
    popular: [{type: mongoose.Schema.Types.ObjectId, ref: 'PodcastCategory' }],
    recentlyPlayed: [{type: mongoose.Schema.Types.ObjectId, ref: 'Podcast' }],
    popularPodcast: [{ type: mongoose.Schema.Types.ObjectId, ref: "PopularPodcast" } ],
}, 


{ timestamps: true });


// podcastSchema.set('toJSON', {
//     virtuals: true,
    
//     transform: function(doc, ret, options){
//         ret.id = ret._id
//         // ret.views = ret.views.length;
//         // ret.suggestedPodcast.id = ret.suggestedPodcast._id;
       
//         delete ret._id
//         delete ret.__v
//         delete ret.suggestedPodcast._id;
//         delete ret.podcastCloudinaryPublicId
      
//         return ret;
        
//     }
// })



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