const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ProductSchema = new Schema({
      name: { type: String, required: true },
      price: { type: Number, required: true }
}, 

{
    toJSON: {
        transform: (document, returnedObject, options) => {
                    returnedObject.id = returnedObject._id
                    delete returnedObject._id
                    delete returnedObject.__v
        }
    }
},

{ timestamps: true });

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;