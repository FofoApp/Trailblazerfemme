const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const podcastSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    podcastImage: { type: String, required: true },
    podcastImages: [{
        public_id: { type: String, required: true },
        image_url: { type: String, required: true },
    }],
    
    adminAccess: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accessType: { type: String, default: 'Free' },

    podcastCloudinaryPublicId: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
    podcastCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'PodcastCategory' },
    hosts: [{
        fullname: { type: String, required: true },
        public_id: { type: String, required: true },
        image_url: { type: String, required: true },
     }],
    createdBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    duration: { type: String, required: true },
    views: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: { type: String, trim: true, default: "" },
    reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rating: { type: Number },
    numReviews: { type: Number },
    episodes: [{type: mongoose.Schema.Types.ObjectId, ref: 'PodcastEpisode' }],
    popular: [{type: mongoose.Schema.Types.ObjectId, ref: 'PodcastCategory' }],
    recentlyPlayed: [{type: mongoose.Schema.Types.ObjectId, ref: 'Podcast' }],
    popularPodcast: [{ type: mongoose.Schema.Types.ObjectId, ref: "PopularPodcast" } ],
    reviewIds: [{ type: ObjectId, ref: "PodcastReview"}]
}, 


{ timestamps: true });


// podcastSchema.index({ name: "text" });

podcastSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.podcastCloudinaryPublicId;
        delete ret.createdBy;
        return ret;
     }
};

podcastSchema.plugin(mongoosePaginate);

const Podcast = mongoose.model('Podcast', podcastSchema);

module.exports = Podcast;