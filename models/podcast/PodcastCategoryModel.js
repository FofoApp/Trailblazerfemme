const mongoose = require('mongoose');


const podcastCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, 
    slug: { type: String },
    podCasts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Podcast'}]
}, 

// {
//     toJSON: {
//         transform: (document, returnedObject, options) => {
//                     returnedObject.id = returnedObject._id
//                     delete returnedObject._id
//                     delete returnedObject.__v
//         }
//     }
// },

{ timestamps: true });

podcastCategorySchema.methods.toJSON = function() {
    const podcastCategory = this;
    const podcastCategoryObject = podcastCategory.toObject();

    podcastCategoryObject.id = podcastCategoryObject._id
    delete podcastCategoryObject._id
    delete podcastCategoryObject.__v
    return podcastCategoryObject
}


const PodcastCategory = mongoose.model('PodcastCategory', podcastCategorySchema);

module.exports = PodcastCategory;