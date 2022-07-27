const mongoose = require('mongoose');

const CartModel = require('./../../models/productModel/cartModel');

exports.addToCart = async (req, res, next) => {

    try {
    
        const addProductToCart = new CartModel(req.body);
        const addedProduct = await addProductToCart.save();

        if(!addedProduct) {
            return res.status(401).send({ message: "Unable to add product to cart"});
        }

        return res.status(200).send({ message: "Product added to cart "});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}
