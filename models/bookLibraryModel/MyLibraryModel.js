const mongoose = require('mongoose');

const myLibrarySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }
});

const MyLibrary = mongoose.model('MyLibrary', myLibrarySchema);

module.exports = MyLibrary;