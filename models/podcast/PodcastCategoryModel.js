const mongoose = require('mongoose');


const podcastCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, 
    slug: { type: String },
}, { timestamps: true });


const PodcastCategory = mongoose.model('PodcastCategory', podcastCategorySchema);

module.exports = PodcastCategory;