const mongoose = require('mongoose');
const slugify = require('slugify')

const podcastCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, 
    slug: { type: String },
    podCasts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Podcast'}]
}, 

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


podcastCategorySchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.podcastCloudinaryPublicId
        return ret;
     }
};


const PodcastCategory = mongoose.model('PodcastCategory', podcastCategorySchema);

module.exports = PodcastCategory;