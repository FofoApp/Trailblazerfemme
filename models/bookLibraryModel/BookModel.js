const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')
const { ObjectId } = mongoose.Schema;

const bookSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: String, required: true },
    bookLink: { type: String,  required: true },
    ratings: { type: Number, default: 0 },
    store: { type: String, default: null },
    description: { type: String, trim: true, default: "" },
    bookImage: [{
        public_id: { type: String, required: true },
        image_url: { type: String, required: true },
    }],
    
    author: [{
        fullname: { type: String, required: true },
        public_id: { type: String, required: true },
        image_url: { type: String, required: true },
    }],
    bookCategoryId:{ type: ObjectId, ref: "BookCategory"},
    readers: [{ type: ObjectId, ref: "User"}],
    createdBy: { type: ObjectId, ref: "User"},
    uploadedBy: { type: ObjectId, ref: "User"},
    reviewIds: [{ type: ObjectId, ref: "BookReview"}],

},

{ timestamps: true });

bookSchema.options.toJSON = {
    // virtuals: true,
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

bookSchema.plugin(mongoosePaginate);

const Book  = mongoose.model('Book', bookSchema);

module.exports = Book;