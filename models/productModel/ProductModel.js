const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: { type: String, required: true },
    description: { type: String, required: true },

    // sm: [{ sm:   { type: String, default: 0 }, smQ: { type: String, default: 0} }],
    // md: [{ md:   { type: String, default: 0 },  mdQ: { type: String, default: 0} }],
    // lg: [{ lg:   { type: String, default: 0 }, lgQ: { type: String, default: 0} }],
    // xxl: [{ xxl:  { type: String, default: 0 }, xxlQ: { type: String, default: 0} }],
    // xxxl: [{ xxxl: { type: String, default: 0 }, xxxlQ: { type: String, default: 0} }],

    sm: { type: Number, default: 0 },
    md: { type: Number, default: 0 },
    lg: { type: Number, default: 0 },
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

    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' },
}, 


{ timestamps: true });


// productSchema.methods.toJSON = function() {
//     const product = this;
//     const productObject = product.toObject();

//     productObject.id = productObject._id
//     delete productObject._id
//     delete productObject.__v

// }

const Product = mongoose.model('Product', productSchema);

module.exports = Product;