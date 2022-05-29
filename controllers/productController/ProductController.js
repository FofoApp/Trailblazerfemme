const mongoose = require('mongoose');
const ProductModel = require('../../models/productModel/ProductModel');
const productCategoryModel = require('../../models/productModel/productCategoryModel');

const { productValidation } = require('./../../validations/productValidation');



const shop = async (req, res, next) => {
//GET REQUEST
//http://localhost:2000/api/product

    try {

        let productCategories = [];
        let products = [];

        productCategories = await productCategoryModel.find({}).select('-__v -createdAt -updatedAt');

        products = await ProductModel.find({}).select('-__v -createdAt -updatedAt');

        return res.status(200).send({ categories: productCategories, products });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

const createNewProduct = async (req, res, next) => {
    //NOTE:: VALIDATE USER INPUTS BEFORE PROCESSING
    //POST REQUEST
    //http://localhost:2000/api/product/create

    /*
{
    "name": "Wrist-Watch",
    "description": "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which able",
    "price": [{
        "s": 2000,  "m": 3000, "l": 4000, "xl": 5000, "xxl": 6000, "xxxl": 7000 } ],
    "colour": ["Yellow", "Blue"],
    "images": [{  "image1": "default.jpg",  "image2": "default.jpg",  "image3": "default.jpg" }],
    "quantity": 5,
    "categoryId": "628cbc4949fca217cbf8962e"
}
    */

    try {
        const result = await productValidation(req.body);
        const createProduct = new ProductModel(result);

        const savedProduct = await createProduct.save();

        return res.status(200).send({ message: savedProduct });


    } catch (error) {
        return res.status(500).send({ message: error.message })
    }


}

const listProducts = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/product/lists
    try {
        const products = await ProductModel.find({});
        if(!products) {
            return res.status(200).send({message: "No product found"});
        }
        return res.status(200).send(products);
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

const getProductsByCategory = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/product/categoryId
    //http://localhost:2000/api/product/628cbc4949fca217cbf8962e
    const categoryId = req.params.categoryId;

    try {

        if(!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(200).send({message: "No product found"});
        }
        const products = await ProductModel.find({categoryId: categoryId });

        if(!products) {
            return res.status(200).send({message: "No product found"});
        }
        return res.status(200).send(products);
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message })
    }
}

const getProductById = async (req, res, next) => {
    //VERIFY IF ID IS CORRECT
    //GET REQUEST
    //http://localhost:2000/api/product/628cae1ec6a0f70b715a869a/product

    const productId = req.params.productId;
    try {
        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(401).send({ message: "Invalid product parameter"});
        }
        const product = await ProductModel.findOne({ _id: productId });
        return res.status(200).send(product);

    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

const updateProductById = async (req, res, next) => {
        //VERIFY IF ID IS CORRECT
        //PATCH REQUEST
        //http://localhost:2000/api/product/628cae1ec6a0f70b715a869a/update

        const productId = req.params.productId;
    try {
        
        const result = await productValidation(req.body, true);

        // const result = registerSchema(dataToUpdate);

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(401).send({ message: "Invalid product parameter"});
        }
        const updateProduct = await ProductModel.findByIdAndUpdate({ _id: productId }, {$set: { ...req.body} }, { new: true } );

        return res.status(200).send({message: "Product updated successfully", updateProduct});
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

const deleteProductById = async (req, res, next) => {
        //VERIFY IF ID IS CORRECT
        //DELETE REQUEST
        //http://localhost:2000/api/product/628cae1ec6a0f70b715a869a/delete

        const productId = req.params.productId;
    try {

        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(401).send({ message: "Invalid product parameter"});
        }
        await ProductModel.findByIdAndUpdate({ _id: productId }, {$set: { ...req.body} }, { new: true } );

        return res.status(200).send({message: "Product deleted successfully"});
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}


module.exports = {
    createNewProduct,
    listProducts,
    getProductById,
    updateProductById,
    deleteProductById,
    getProductsByCategory,
    shop,
}

