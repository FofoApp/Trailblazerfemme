const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let itemSchema = new Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", },
    quantity: { type: Number, required: true, min: [1, 'Quantity can not be less then 1.'] },
    colors: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true },
    total: { type: Number, required: true, }


}, {  timestamps: true });


const cartSchema = new Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", },
    orderStatus: { type: String, default: "ordered"},
    paymentStatus: { type: Boolean, default: false },
    items: [itemSchema],
    subTotal: { type: Number, default: 0,  }
    
}, { timestamps: true })


module.exports = mongoose.model('Cart', cartSchema);