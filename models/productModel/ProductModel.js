const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')
const productSchema = new mongoose.Schema({

    name: { type: String, required: true, unique: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accessType: { type: String, default: 'Free' },

    description: { type: String, required: true },
    stock:  { type: Number, maxlength: [20, "Max stock size is 20"], default: 0 },

    product_variation: [
        {
            size: {  type: String, uppercase: true, default: null },
            price: {  type: Number, min:0,  required: [true, 'Please provide price for variable product'] },
            qty: {  type: Number, min:1,  default: 0, },
            color: {  type: String,   default: "transparent",  },
        }
    ],

    top_sellers: { type: [String]},


    product_images: [{
            public_id: { type: String },
            secure_url: { type: String }
        }],

    ratings: { type: Number, default: 0 },

    numOfReviews: { type: Number, default: 0 },
    
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductReview', default: [] }] ,

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' },
}, 


{ timestamps: true });


productSchema.options.toJSON = {
    transform: function(doc, ret, options) {

        if(ret.product_variation) {
            ret.product_variation.forEach((item) => {
                item.id = item._id
                delete item._id
            });
        }

        if(ret.product_images) {
            ret.product_images.forEach((item) => {
                item.id = item._id
                delete item.public_id
                delete item._id
            });
        }

        // if(ret.reviews && ret.reviews.length > 0) {
        //     ret.reviews.forEach((item) => {
        //         return item.numOfReviews = item.reviews.reduce((acc, curr) => curr.rating + acc, 0) / item.reviews.length
        //     } )
        // }

        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

productSchema.plugin(mongoosePaginate)

const Product = mongoose.model('Product', productSchema);
// Product.createIndexes();

module.exports = Product;