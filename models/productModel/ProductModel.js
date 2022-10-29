const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: { type: String, required: true, unique: true },

    description: { type: String, required: true },
    stock:  { type: Number, maxlength: [20, "Max stock size is 20"], default: 0 },

    sm: { type: Number, default: 0 },
    md: { type: Number, default: 0 },
    lg: { type: Number, default: 0 },
    xl: { type: Number, default: 0 },
    xxl: { type: Number, default: 0 },
    xxxl: { type: Number, default: 0 },

    smQ: { type: Number, default: 0 },
    mdQ: { type: Number, default: 0 },
    lgQ: { type: Number, default: 0 },
    xxlQ: { type: Number, default: 0 },
    xxxlQ: { type: Number, default: 0 },

    colors: { type: [String], default: [] },

    images: [  { publicId: { type: String } , imgUrl: { type: String } } ],

    quantity: { type: Number, default: 0 },

    ratings: [{ type: Number, default: 0 }],

    // reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

    numOfReviews: { type: Number, default: 0 },
    reviews: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
            name: { type: String, require: true },
            rating: { type: Number, require: true },
            comment: { type: String, require: true },
        }
    ],

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' },
}, 


{ timestamps: true });

const Product = mongoose.model('Product', productSchema);
Product.createIndexes();

module.exports = Product;