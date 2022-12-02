const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    slug: {type: String },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, 

{ timestamps: true });


productCategorySchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.podcastCloudinaryPublicId
        return ret;
     }
};

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);

module.exports = ProductCategory;