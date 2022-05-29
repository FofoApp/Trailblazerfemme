const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: [{ 
        s: {type: Number, default: 0 }, 
        m: {type: Number, default: 0 },
        l: {type: Number, default: 0 },
        xl: {type: Number, default: 0 },
        xxl: {type: Number, default: 0 },
        xxxl: {type: Number, default: 0 },
    }],
    colour: { type: [String], default: [] },
    images: [{ 
        image1: { type: String, default: "default.jpg"}, 
        image2: { type: String, default: "default.jpg"}, 
        image3: { type: String, default: "default.jpg"}, 
    }],
    quantity: { type: Number, default: 0 },
    ratings: [{ type: Number, default: 0 }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' },
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;