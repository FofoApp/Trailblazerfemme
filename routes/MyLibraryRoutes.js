const express = require('express');
const router = express.Router();


//CONTROLLERS IMPORT
const MyLibraryController = require('./../controllers/BookLibraryController/MyLibraryController');
const BookLibraryCategoryController = require('../controllers/BookLibraryController/BookLibraryCategoryController');
const BookController = require('./../controllers/BookLibraryController/BookController');


//ROLES AND PERMISION IMPORT
const { verifyAccessToken } = require('./../helpers/jwtHelper');
const { permissions } = require('../middlewares/permissionsMiddleware');


//FILES AND UPLOAD
const upload = require('./../helpers/multer');


//ROUTES
router.get('/', verifyAccessToken, permissions(["user", "admin"]), MyLibraryController.fetchAllBooksInLibrary);
router.get('/search', verifyAccessToken, permissions(["user", "admin"]), MyLibraryController.searchBookInLibrary);
router.patch('/book/:bookId/read', verifyAccessToken, permissions(["user", "admin"]), MyLibraryController.userReadBook, MyLibraryController.readBook);
router.get('/book/:bookId/book', verifyAccessToken, permissions(["user", "admin"]), MyLibraryController.searchBookInLibraryById);
router.patch('/book/:bookId/add-book-to-library', verifyAccessToken, permissions(["user", "admin"]), MyLibraryController.addBookToMyLibrary);


//BOOK CATEGORY
//USERs AND ADMIN ACCESS ROUTES
router.get('/categories', verifyAccessToken, permissions(["user", "admin"]), BookLibraryCategoryController.fetchBookCategories);
router.get('/category/:categoryId/get', verifyAccessToken, permissions(["user", "admin"]), BookLibraryCategoryController.fetchBookCategoryById);


//BOOK CATEGORY
//ADMIN ACCESS ROUTES ONLY 
router.post('/category/create', verifyAccessToken,  permissions(["admin"]), BookLibraryCategoryController.createNewBookCategory);
router.put('/category/:categoryId/update', verifyAccessToken, permissions(["admin"]), BookLibraryCategoryController.updateBookCategoryById);
router.delete('/category/:categoryId/delete', verifyAccessToken, permissions(["admin"]), BookLibraryCategoryController.deleteBookCategoryById);


//BOOK
//USERS AND ADMIN ACCESS ROUTES ONLY
router.get('/books', verifyAccessToken, permissions(["user","admin"]), BookController.fetchBooks);
router.post('/book/create', verifyAccessToken, permissions(["admin"]), upload.single('bookImage'), BookController.createNewBook);
router.post('/book/trending', verifyAccessToken, permissions(["user","admin"]), BookController.trendingBooks);
router.get('/book/search', verifyAccessToken, permissions(["user","admin"]), BookController.searchBook);
router.get('/book/:bookId/get', verifyAccessToken, permissions(["user","admin"]), BookController.fetchBookById);
router.patch('/book/:bookId/update', verifyAccessToken, permissions(["user","admin"]), BookController.updateBookById);
router.delete('/book/:bookId/delete', verifyAccessToken, permissions(["admin"]), BookController.deleteBookById);



module.exports = router;