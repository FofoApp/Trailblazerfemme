const mongoose = require('mongoose');


const podcastCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, 
    slug: { type: String },
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


const PodcastCategory = mongoose.model('PodcastCategory', podcastCategorySchema);

module.exports = PodcastCategory;