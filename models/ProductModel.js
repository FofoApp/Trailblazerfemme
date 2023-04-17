const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ProductSchema = new Schema({
      name: { type: String, required: true },
      price: { type: Number, required: true }
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


// {
//     toJSON: {
//         transform: function(doc, ret, opts) {
//             ret.id = ret._id.toString();
//             delete ret._id;
//             delete __v;


//         }
//     }
// },

{ timestamps: true });

ProductSchema.methods.toJSON = function() {
    const product = this;
    const productObject = product.toObject();

    productObject.id = productObject._id
    delete productObject._id
    delete productObject.__v
    return productObject
}

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;