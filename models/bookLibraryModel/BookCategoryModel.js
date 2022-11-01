const mongoose = require('mongoose');
const { ObjectId} = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const bookCategorySchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    iconName: { type: String, default: null },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],
},

{ timestamps: true });

bookCategorySchema.options.toJSON = {
    // virtuals: true,
    transform: function(doc, ret, options) {
        
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

bookCategorySchema.plugin(mongoosePaginate);


const BookCategory = mongoose.model('BookCategory', bookCategorySchema);
module.exports = BookCategory;