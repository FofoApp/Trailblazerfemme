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
 });

const Cart = mongoose.model('Cart', cartSchema);


module.exports = Cart;