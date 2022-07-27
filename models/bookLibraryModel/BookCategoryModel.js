const mongoose = require('mongoose');

const bookCategorySchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    iconName: { type: String, default: null }
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


const BookCategory = mongoose.model('BookCategory', bookCategorySchema);
module.exports = BookCategory;