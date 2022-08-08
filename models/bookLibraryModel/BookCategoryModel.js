const mongoose = require('mongoose');
const { ObjectId} = mongoose.Schema;

const bookCategorySchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    iconName: { type: String, default: null },
    books: [{ type: ObjectId, ref: "Book"}],
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

bookCategorySchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options){
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;

        return ret;
    }
})


const BookCategory = mongoose.model('BookCategory', bookCategorySchema);
module.exports = BookCategory;