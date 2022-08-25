const mongoose = require('mongoose');

const CartModel = require('../../models/productModel/cartModel');
const ProductModel = require('../../models/productModel/ProductModel');

exports.getAllOrdersForAUser = async (req, res, next) => {

    // const owner = req.user.id;

    try {
    
        const orders = await CartModel.find({ owner }).sort({ createdAt: -1 });

        if(!orders) return res.status(400).send({ error: "No order(s) found"});

        return res.status(200).send(orders);

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}



exports.addToCart = async (req, res, next) => {
    //http://localhost:2000/api/product/add-to-cart
    // const owner = req.user.id;
    const owner = "628695d03cf50a6e1a34e27b";

    let { productId, size, quantity, price, color } = req.body;

        quantity = Number.parseInt(quantity);

    let keyName = Object.keys({ size, quantity }).join(" ");
    let sizeSet = false;

    try {

        const productDetails  = await ProductModel.findById(productId);

        const carts = await CartModel.find({ owner: owner }).populate({
            path: "items.productId",
            select: `${keyName} name total, colors images`
        });

        let cart = carts[0];
        
        //--If Cart Exists ----
        
        
        if(cart) {

        cart.items.forEach((item) => sizeSet = item.size === size ? item.size === size : false );

        //---- check if index exists ----
         const indexFound = cart?.items.findIndex(item => item.productId.id == productId && item.size == size);

         if (indexFound !== -1 && quantity <= 0) {

            //------this removes an item from the the cart if the quantity is set to zero,We can use this method to remove an item from the list  -------
            cart.items.splice(indexFound, 1);

            if (cart.items.length === 0) {

                cart.subTotal = 0;

            } else {

                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);

            }

        } else if (indexFound !== -1) {
            //----------check if product exist,just add the previous quantity with the new quantity and update the total price-------

            cart.items[indexFound].quantity = cart.items[indexFound].quantity + quantity;
            cart.items[indexFound].total = cart.items[indexFound].quantity * productDetails[size];
            cart.items[indexFound].price = productDetails[size];
            cart.items[indexFound].colors = color;

            cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
    
        } else if (quantity > 0) {
         //----Check if Quantity is Greater than 0 then add item to items Array ----
            cart.items.push({
                productId: productId,
                quantity: quantity,
                total: parseInt(productDetails[size] * quantity),
                price: productDetails[size],
                colors: color,
                size: size,
            });

            cart.owner = owner;
            cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);

        } else {
        
        //----if quantity of price is 0 throw the error -------
           return res.status(400).json({  error: "Invalid request" });

        }

       let data = await cart.save();
       res.status(200).json({cart: data })
           
        //End If statement
    } else {
            const cartData = {
                items: [{
                    productId: productId,
                    quantity: quantity,
                    total: parseInt(productDetails[size] * quantity),
                    price: productDetails[size],
                    colors: color,
                    size: size,
                }],
                owner: owner,
                subTotal: parseInt(productDetails[size] * quantity)
            }
    
    
            const addCart = new CartModel(cartData);
            cart = await addCart.save();
    
            // let data = await cart.save();
            return res.status(200).send(cart);
        }

        // return res.status(200).send({  cart });

    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: error.message });
    }
}




exports.removeFromCart = async (req, res, next) => {
    //http://localhost:2000/api/product/remove-from-cart
    // const owner = req.user.id;
    const owner = "628695d03cf50a6e1a34e27b";

    let { productId, size,  price, color } = req.body;

      let  quantity = Number.parseInt(1);

    let keyName = Object.keys({ size, quantity }).join(" ");

    
    try {
    
        const productDetails  = await ProductModel.findById(productId);

        const carts = await CartModel.find().populate({
            path: "items.productId",
            select: `${keyName} name total, colors images`
        });

        let cart = carts[0];
        const indexFound = cart && cart.items.findIndex(item => item.productId.id === productId && item.size == size);

        if(!cart) return res.status(200).send({ error: "No item(s) in cart"})

        // console.log(carts)
        
        if(cart && cart.items.length === 0) {
            
            cart.subTotal = 0;
            await cart.remove();
            return res.status(200).send({ success: "Your cart is empty !"});
        };

    
        //---- check if index exists ----

        if(indexFound === -1) return res.status(200).send({ success: "Item not found"});
        //--If No item in cart delete the entire document ----
        
        if(cart && cart.items.length === 0 ) {
            await cart.remove();
            return res.status(200).send({ success: "No item in cart"});
        }

        //--IF cart item quantity is greater than 1, decrement by 1 ----
        if(cart && cart.items[indexFound].quantity > 1) {

        cart.items[indexFound].quantity = cart.items[indexFound].quantity -= 1;
        cart.items[indexFound].total = cart.items[indexFound].quantity * productDetails[size];
        cart.items[indexFound].price = productDetails[size];
        cart.items[indexFound].colors = color;
        //cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
        cart.subTotal = cart.items.map(item => item.total).reduce((acc, curr) => {
            return acc + curr;
        }, 0);

        await cart.save();
        return res.status(200).send({ success: "Item decremented"});
        }


        //--Find and delete an item in cart using its index ----
        if(cart && cart.items[indexFound].quantity <= 1) {
        cart.items.splice(indexFound, 1);
        cart.subTotal = 0;

        cart.subTotal = cart.items.map(item => item.total).reduce((acc, curr) => {
            return acc + curr;
        }, 0);

        if( cart.items.length === 0) {
            await cart.remove();
            return res.status(200).send({ success: "Your cart is empty!"});

        }

        await cart.save();
        return res.status(200).send({ success: "Item removed"});

        }


    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message });
    }
}


exports.removeSingleItemFromCart = async (req, res) => {
    //http://localhost:2000/api/product/remove-single-item-from-cart

    // const owner = req.user.id;
    const owner = "628695d03cf50a6e1a34e27b";

    let { productId, size,  price, color } = req.body;

      let  quantity = Number.parseInt(1);

    let keyName = Object.keys({ size, quantity }).join(" ");

    let sizeSet = false;

    try {
    
        const productDetails  = await ProductModel.findById(productId);

        const carts = await CartModel.find().populate({
            path: "items.productId",
            select: `${keyName} name total, colors images`
        });

        let cart = carts[0];



        if(!cart) return res.status(400).send({ error: "Cart is empty"})

            //--If Cart Exists ----
            cart.items.forEach((item) => sizeSet = item.size === size ? item.size === size : false );
    
            //---- check if index exists ----
            const indexFound = cart?.items.findIndex(item => item.productId.id == productId && item.size == size);

            if (indexFound !== -1 ) {

            //------this removes an item from the the cart if the quantity is set to zero,We can use this method to remove an item from the list  -------
            cart.items.splice(indexFound, 1);

            if (cart.items.length === 0) {

                cart.subTotal = 0;

            } else {

                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);

            }

            await cart.save();

            return res.status(200).json({ cart });

        } else {

            await cart.remove();
            return res.status(200).json({ error: "Cart is empty" });

        }


    } catch (error) {
       
        res.status(500).json({ error: error.message });
    }
}


exports.emptyCart = async (req, res) => {
  // const owner = req.user.id;
  const owner = "628695d03cf50a6e1a34e27b";

  let { productId, size,  price, color } = req.body;

    let  quantity = Number.parseInt(1);

  let keyName = Object.keys({ size, quantity }).join(" ");
  let sizeSet = false;

  try {
  
      const productDetails  = await ProductModel.findById(productId);

      const carts = await CartModel.find().populate({
          path: "items.productId",
          select: `${keyName} name total, colors images`
      });

        const cart = carts[0];
        cart.items = [];
        cart.subTotal = 0


        let data = await cart.save();

        return res.status(200).json({ success: "Cart Has been emptied" })
    } catch (error) {
       
        res.status(500).json({ error: error.message });
    }
}