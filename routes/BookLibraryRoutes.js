const express = require('express');
const router = express.Router();

const BookLibraryCategoryController = require('../controllers/BookLibraryController/BookLibraryCategoryController');
const { verifyAccessToken } = require('./../helpers/jwtHelper');
const { permissions } = require('./../middlewares/permissionsMiddleware');

router.get('/categories', verifyAccessToken, BookLibraryCategoryController.fetchBookCategories);
router.get('/:id/category', verifyAccessToken, BookLibraryCategoryController.fetchBookCategoryById);
router.put('/:id/category/update', verifyAccessToken, permissions(["admin"]), BookLibraryCategoryController.updateBookCategoryById);
router.delete('/:id/category/delete', verifyAccessToken, permissions(["admin"]), BookLibraryCategoryController.deleteBookCategoryById);
router.post('/category/create', verifyAccessToken, BookLibraryCategoryController.createNewBookCategory);


module.exports = router;