const express = require('express');
const router = express.Router();

const ProductController = require('../controllers/productController/ProductController');
const productCategoryController = require('../controllers/productController/productCategoryController');
const cartController = require('../controllers/productController/cartController');
const { verifyAccessToken } = require('./../helpers/jwtHelper');

const { permissions } = require('./../middlewares/permissionsMiddleware');
const upload = require('./../helpers/multer');
const uploadCv = require('./../helpers/multerCVupload');

//PRODUCT ROUTES
router.get('/', ProductController.shop);
router.get('/lists', ProductController.listProducts);
router.get('/:categoryId', ProductController.getProductsByCategory);
router.get('/:productId/product', ProductController.getProductById);


//ADMIN PRODUCT ROUTES
router.post('/create', verifyAccessToken, permissions(["admin"]), upload.array(['image1, image2, image3']), ProductController.createNewProduct);
router.patch('/:productId/update', verifyAccessToken, permissions(["admin"]), ProductController.updateProductById);
router.delete('/:productId/delete', verifyAccessToken, permissions(["admin"]), ProductController.deleteProductById);



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