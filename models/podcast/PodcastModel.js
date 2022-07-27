const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    topic: { type: String, required: true },
    imagePath: { type: String, required: true },
    about: { type: String },
    hosts: { type: String },
    tags: { type: [String ], default: [] },
    popularPodcast: [{ type: mongoose.Schema.Types.ObjectId, ref: "PopularPodcast" } ],
    podcastCategoryId: {type: mongoose.Schema.Types.ObjectId, ref: 'PodcastCategory' },

    podcastHostId: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    views: [{type: mongoose.Schema.Types.ObjectId }],

    episodes: [{type: mongoose.Schema.Types.ObjectId, ref: 'PodcastEpisode' }],
    reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    popular: [{type: mongoose.Schema.Types.ObjectId, ref: 'PodcastCategory' }],
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

const Podcast = mongoose.model('Podcast', podcastSchema);

module.exports = Podcast;