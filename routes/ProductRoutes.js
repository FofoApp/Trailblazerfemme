const express = require('express');
const router = express.Router();

const ProductController = require('../controllers/productController/ProductController');
const productCategoryController = require('../controllers/productController/productCategoryController');
const CartController = require('../controllers/productController/cartController');
const orderController = require('./../controllers/productController/orderController')
const { verifyAccessToken } = require('./../helpers/jwtHelper');

const { permissions } = require('./../middlewares/permissionsMiddleware');
const upload = require('./../helpers/multer');
const uploadCv = require('./../helpers/multerCVupload');

//PRODUCT ROUTES

router.get('/', verifyAccessToken, permissions(["user","admin"]), ProductController.shop);
router.get('/order', verifyAccessToken, permissions(["user","admin"]), CartController.getAllOrdersForAUser);
router.get('/order_lists', verifyAccessToken, permissions(["user", "admin"]), CartController.allOrders);
router.get('/:productId/reviews', verifyAccessToken, permissions(["user","admin"]), ProductController.getAllReviews);
router.post('/:productId/review', verifyAccessToken, permissions(["user","admin"]), ProductController.productReview);

router.get('/lists', verifyAccessToken, permissions(["user","admin"]), ProductController.listProducts);

router.get('/:categoryId', verifyAccessToken, permissions(["user","admin"]), ProductController.getProductsByCategory);
router.get('/:productId/product', verifyAccessToken, permissions(["user","admin"]), ProductController.getProductById);



//ADMIN PRODUCT ROUTES
router.post('/create', verifyAccessToken, permissions(["admin"]), upload.any('productImages'), ProductController.createNewProduct);
// router.post('/create', verifyAccessToken, upload.any('productImages'), ProductController.createNewProduct);


router.patch('/:productId/update', verifyAccessToken, permissions(["admin"]), upload.any('productImages'), ProductController.updateProductById);
// router.patch('/:productId/update', verifyAccessToken, upload.any('productImages'),  ProductController.updateProductById);


router.delete('/:productId/delete', verifyAccessToken, permissions(["admin"]), ProductController.deleteProductById);
// router.delete('/:productId/delete', verifyAccessToken,  ProductController.deleteProductById);





//PRODUCT CATEGORY ROUTES

router.get('/categories/fetch', verifyAccessToken,  permissions(["admin"]), productCategoryController.categories);
router.post('/category/create', verifyAccessToken,  permissions(["admin"]), productCategoryController.createProductCategory);
router.get('/category/search', verifyAccessToken,  permissions(["user","admin"]), productCategoryController.searchProductByCategory);
router.patch('/category/:productCategoryId/update', verifyAccessToken,  permissions(["admin"]), productCategoryController.updateProductCategoryById);
router.delete('/category/:productCategoryId/delete', verifyAccessToken,  permissions(["admin"]), productCategoryController.deleteProductCategoryById);


//PRODUCT CATEGORY ROUTES


// router.get('/category/search', productCategoryController.searchProductByCategory);
// router.patch('/category/:productCategoryId/update', productCategoryController.updateProductCategoryById);
// router.delete('/category/:productCategoryId/delete', productCategoryController.deleteProductCategoryById);


//SHOPPING CART

router.post('/create-order', verifyAccessToken, permissions(["user","admin"]), orderController.addOrderItem );
router.post('/my-orders', verifyAccessToken, permissions(["user","admin"]), orderController.getMyOrders );


// router.get('/myorder', verifyAccessToken, permissions(["user","admin"]), CartController.getAllOrdersForAUser);
// router.post('/add-to-cart', verifyAccessToken, permissions(["user","admin"]), CartController.addToCart);
// router.patch('/remove-from-cart', verifyAccessToken, permissions(["user","admin"]), CartController.removeFromCart);
// router.patch('/remove-single-item-from-cart', verifyAccessToken, permissions(["user","admin"]), CartController.removeSingleItemFromCart);
// router.delete('/empty-cart', verifyAccessToken, permissions(["user","admin"]), CartController.emptyCart);
// router.post('/checkout', verifyAccessToken, permissions(["user","admin"]), CartController.checkout);

module.exports = router;