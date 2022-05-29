const express = require('express');
const router = express.Router();
const MyLibraryController = require('./../controllers/BookLibraryController/MyLibraryController');
const { verifyAccessToken } = require('./../helpers/jwtHelper');

router.get('/lists', verifyAccessToken, MyLibraryController.fetchAllBooksInLibrary);
router.get('/search', verifyAccessToken, MyLibraryController.searchBookInLibrary);
router.post('/:bookId/read', verifyAccessToken, MyLibraryController.readBook);
router.get('/:bookId/book', verifyAccessToken, MyLibraryController.searchBookInLibraryById);
router.post('/:bookId/add-book-to-library', verifyAccessToken, MyLibraryController.addBookToMyLibrary);

module.exports = router;