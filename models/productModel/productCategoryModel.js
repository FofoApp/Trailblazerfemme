const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    slug: {type: String }
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

productCategorySchema.methods.toJSON = function() {
    const productCategory = this;
    const productCategoryObject = productCategory.toObject();

    productCategoryObject.id = productCategoryObject._id
    delete productCategoryObject._id
    delete productCategoryObject.__v
    return productCategoryObject
}

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);

module.exports = ProductCategory;