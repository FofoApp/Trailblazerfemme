const mongoose = require('mongoose');
const slugify = require('slugify')

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


podcastCategorySchema.pre('save', async function(next) {

    try {
        
        const name = this.name;

        this.slug = slugify(name, {
            replacement: '-',  // replace spaces with replacement character, defaults to `-`
            remove: undefined, // remove characters that match regex, defaults to `undefined`
            lower: true,      // convert to lower case, defaults to `false`
            strict: false,     // strip special characters except replacement, defaults to `false`
            trim: true         // trim leading and trailing replacement chars, defaults to `true`
          });

        next();
    
    } catch (error) {
        next(error);
    }

});

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