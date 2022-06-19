const createError = require('http-errors');
const mongoose = require('mongoose');

const ProductModel = require('./../models/ProductModel');
module.exports = {
      // createNewProduct: async (req, res, next) => {
      //       try{
      //             const { name, price } = req.body;
      //             const newProduct = new ProductModel({name, price});
      //             const result = await newProduct.save();
      //             console.log(result);
      //             return res.status(200).json(result);
      //       } catch(error) {
      //             console.log(error.message)
      //             if(error.name === 'ValidationError') {
      //                   next(createError(422, error.message));
      //                   return;
      //             }
      //             next(error);
      //       }
      // },

      getAllProducts: async (req, res, next) => {
            try {
                  const products = ProductModel.find({}, { __v: 0 });
                  return res.status(200).json(products);
            } catch (error) {
                  return res.status(404).json(err.message);
            }
      },

      getProductById: async (req, res, next) => {
            try{
                  const id = req.params.id;
                  const product = await ProductModel.findById(id);
                  if(!product) {
                        throw createError(404, 'Product does not exist');
                  }
            } catch(error) {
                  console.log(error.message);
                  if(error instanceof mongoose.CastError) {
                        next(createError(400, 'Invalid product id'));
                        return;
                  }
                  next(error);
            }
      
      },
      updateProductById: async (req, res, next) => {
            const id = req.params.id;
            const updates = req.body;
            const options = { new: true }
            
            try {
                  const product = await ProductModel.findByIdAndUpdate(id, updates, options);
                  if(!product) {
                        throw createError(404, 'Product does not exist');
                  }
      
            } catch (error) {
                  console.log(error.message);
                  if(error instanceof mongoose.CastError) {
                        next(createError(400, 'Invalid product id'));
                        return;
                  }
                  next(error);
            }
      
      },

      deleteProductById: async (req, res, next) => {
            const id = req.params.id;
            try {
                  const id = req.params.id;
                  const result = await ProductModel.findByIdAndDelete(id);
                  if(!result) {
                        throw createError(404, 'Product does not exist');
                  }
            } catch (error) {
                  console.log(error.message);
                  if(error instanceof mongoose.CastError) {
                        next(createError(400, 'Invalid product id'));
                        return;
                  }
                  next(error);
            }
      }


}