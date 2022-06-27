// const express = require('express');
// const router = express.Router();

// const BookController = require('./../controllers/BookLibraryController/BookController');
// const upload = require('./../helpers/multer');
// const { verifyAccessToken } = require('./../helpers/jwtHelper');



// router.post('/create', verifyAccessToken, upload.single('bookImage'), BookController.createNewBook);
// router.get('/lists', verifyAccessToken, BookController.fetchBooks);
// router.post('/trending', verifyAccessToken, BookController.trendingBooks);
// router.get('/search', verifyAccessToken, BookController.searchBook);
// router.get('/:categoryId/book', verifyAccessToken, BookController.fetchBookById);
// router.put('/:categoryId/update', verifyAccessToken, BookController.updateBookById);
// router.delete('/:categoryId/delete', verifyAccessToken, BookController.deleteBookById);


// module.exports = router;