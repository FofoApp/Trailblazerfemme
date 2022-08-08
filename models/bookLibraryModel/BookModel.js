const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

const bookSchema = new mongoose.Schema({

    title: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    price: { type: String, required: true },
    bookLink: { type: String,  required: true },
    ratings: { type: Number, default: 0 },
    store: { type: String, default: null },
    cloudinaryPublicId: { type: String, required: true },
    bookImage: { type: String, required: true },
    bookCategoryId:{ type: ObjectId, ref: "BookCategory"},
    readers: [{ type: ObjectId, ref: "User"}],
    createdBy: { type: ObjectId, ref: "User"},

    // recentSearch: [{ type: ObjectId, ref: "Book" }],
    // trendingBookId: [{ type: ObjectId, ref: 'TrendingBook'}],

},

{ timestamps: true });

// bookSchema.methods.toJSON = function() {
//     const book = this;
//     const bookObject = book.toObject();

//     bookObject.id = bookObject._id
//     delete bookObject._id
//     delete bookObject.__v
//     return bookObject
// }

bookSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret, options){
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;

        return ret;
    }
})


const Book  = mongoose.model('Book', bookSchema);

module.exports = Book;