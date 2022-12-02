const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')
const productSchema = new mongoose.Schema({

    name: { type: String, required: true, unique: true },

    description: { type: String, required: true },
    stock:  { type: Number, maxlength: [20, "Max stock size is 20"], default: 0 },

    product_variation: [
        {
            size: {  type: String, uppercase: true,  default: "", required: [true, 'Size field is required'] },
            price: {  type: Number, min:0,  default: 0, required: [true, 'Price field is required'] },
            qty: {  type: Number, min:0,  default: 0, required: [true, 'Quantity field is required'] },
            color: {  type: String,   default: "", required: [true, 'Color field is required'] },
        }
    ],


    product_images: [  { public_id: { type: String } , secure_url: { type: String } } ],

    // reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

    ratings: [{ type: Number, default: 0 }],

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