// const express = require('express');
// const router = express.Router();

// const BookLibraryCategoryController = require('../controllers/BookLibraryController/BookLibraryCategoryController');
// const { verifyAccessToken } = require('../helpers/jwtHelper');
// const { permissions } = require('../middlewares/permissionsMiddleware');

// //USER AND ADMIN ACCESS
// router.get('/categories', verifyAccessToken, permissions(["user", "admin"]), BookLibraryCategoryController.fetchBookCategories);
// router.get('/category/:categoryId/get', verifyAccessToken, permissions(["user", "admin"]), BookLibraryCategoryController.fetchBookCategoryById);


// //ADMIN ACCESS ONLY
// router.post('/category/create', verifyAccessToken,  permissions(["admin"]), BookLibraryCategoryController.createNewBookCategory);
// router.put('/category/:categoryId/update', verifyAccessToken, permissions(["admin"]), BookLibraryCategoryController.updateBookCategoryById);
// router.delete('/category/:categoryId/delete', verifyAccessToken, permissions(["admin"]), BookLibraryCategoryController.deleteBookCategoryById);


// module.exports = router;