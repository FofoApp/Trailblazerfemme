const mongoose = require('mongoose');

const myLibrarySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }
}, { timestamps: true });


myLibrarySchema.methods.toJSON = function() {
    const myLibrary = this;
    const myLibraryObject = myLibrary.toObject();

    myLibraryObject.id = myLibraryObject._id
    delete myLibraryObject._id
    delete myLibraryObject.__v
    return myLibraryObject
}

const MyLibrary = mongoose.model('MyLibrary', myLibrarySchema);

module.exports = MyLibrary;