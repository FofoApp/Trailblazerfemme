const express = require('express');
const router = express.Router();

const ProductController = require('./../controllers/ProductController');

//Get all products
router.get('/', ProductController.getAllProducts);

//Create New product
router.post('/', ProductController.createNewProduct);

//Get a single product by id
router.get('/:id', ProductController.getProductById);

//update a single product by id
router.patch('/:id', ProductController.updateProductById);

//Delete a single product by id
router.delete('/:id', ProductController.deleteProductById);

module.exports = router;