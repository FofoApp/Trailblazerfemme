const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    picture: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: String, required: true },
    size:  { type: String, default: null },
    colour:  { type: String, default: null },
    quantity: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory'},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
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

cartSchema.methods.toJSON = function() {
    const cart = this;
    const cartObject = cart.toObject();

    cartObject.id = cartObject._id
    delete cartObject._id
    delete cartObject.__v
    return cartObject
}

const Cart = mongoose.model('Cart', cartSchema);


module.exports = Cart;