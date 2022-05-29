const express = require('express');
const router = express.Router();

const ProductController = require('../controllers/productController/ProductController');
const productCategoryController = require('../controllers/productController/productCategoryController');
const cartController = require('../controllers/productController/cartController');



//PRODUCT ROUTES
router.get('/', ProductController.shop);
router.post('/create', ProductController.createNewProduct);
router.get('/lists', ProductController.listProducts);
router.get('/:categoryId', ProductController.getProductsByCategory);
router.get('/:productId/product', ProductController.getProductById);
router.patch('/:productId/update', ProductController.updateProductById);
router.delete('/:productId/delete', ProductController.deleteProductById);



//PRODUCT CATEGORY ROUTES
router.post('/category/create', productCategoryController.createProductCategory);
router.get('/category/search', productCategoryController.searchProductByCategory);
router.patch('/category/:productCategoryId/update', productCategoryController.updateProductCategoryById);
router.delete('/category/:productCategoryId/delete', productCategoryController.deleteProductCategoryById);


//PRODUCT CATEGORY ROUTES
router.post('/add-to-cart', cartController.addToCart);

// router.get('/category/search', productCategoryController.searchProductByCategory);
// router.patch('/category/:productCategoryId/update', productCategoryController.updateProductCategoryById);
// router.delete('/category/:productCategoryId/delete', productCategoryController.deleteProductCategoryById);

module.exports = router;