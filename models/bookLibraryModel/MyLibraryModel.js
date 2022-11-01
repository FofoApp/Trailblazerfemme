const mongoose = require('mongoose');

const myLibrarySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }
}, { timestamps: true });



myLibrarySchema.options.toJSON = {
    // virtuals: true,
    transform: function(doc, ret, options) {
        
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret;
     }
};

const MyLibrary = mongoose.model('MyLibrary', myLibrarySchema);

module.exports = MyLibrary;