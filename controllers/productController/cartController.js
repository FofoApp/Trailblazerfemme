const mongoose = require('mongoose');

const CartModel = require('../../models/productModel/cartModel');
const ProductModel = require('../../models/productModel/ProductModel');
const Order = require('../../models/productModel/orderModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.getAllOrdersForAUser = async (req, res, next) => {
    //http://localhost:2000/api/product/order
      const owner = req.user.id;
    // const owner = "628695d03cf50a6e1a34e27b";


    try {
    
        
        const orders = await CartModel.find({ owner }).sort({ createdAt: -1 });

        if(!orders || orders.length === 0) {
            return res.status(400).json({ status: "failed", message: "No order(s) found", error: "No order(s) found"});
        }

        return res.status(200).send(orders);

    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message });
    }
}

exports.allOrders = async (req, res, next) => {

    //http://localhost:2000/api/product/all_order?search="Adewumi"

    let { page = 1, limit = 5 } = req.query;

    if(page) page = Number(page);
    if(limit) limit = Number(limit);

    const search = req?.query?.search 
    ? { user: { $regex: '.*' + req.query.search + ".*", $options: 'i' } } 
    : {}
 
    try {

        const orders = await Order.paginate({},
            {
                page, limit,

                select: "orderItems shippingAddress taxPrice shippingPrice totalPrice paymentResult isPaid isDelivered orderId createdAt",
                populate: [
                    {
                    path: 'user',
                    model: 'User',
                    select: 'id fullname profileImage createdAt',
                    },
                    {
                        path: 'orderItems.product',
                        model: 'Product',
                        select: 'name product_images createdAt',
                    }
            ],
                sort: { createdAt: -1 },
            }
            );

        if(!orders || orders.length === 0) {
            return res.status(400).json({ status: "failed", error: "No order(s) found"});
        }

        return res.status(200).json({ status: "success", orders });

    } catch (error) {
        // console.log(error)
        return res.status(500).send({ status: "failed", message: error?.message });
    }
}

exports.addToCart = async (req, res, next) => {
    //http://localhost:2000/api/product/add-to-cart
    const owner = req.user.id;
    // const owner = "628695d03cf50a6e1a34e27b";

    let { productId, size, color } = req.body;

    let quantity = Number.parseInt(1);

    let keyName = Object.keys({ size, quantity }).join(" ");

    try {

        const productDetails  = await ProductModel.findById(productId);

        const carts = await CartModel.find({ owner: owner }).populate({
            path: "items.productId",
            select: `${keyName} colors name total images`
        });

        let cart = carts[0];
        
        //--If Cart Exists ----

        const indexFound = cart && cart.items.findIndex(item => item.productId.id === productId && item.size == size);

        //ADD TO CART IF CART IS EMPTY
        if(!cart) {

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

        return res.status(200).send(cart);

        }

        //IF CART IS NOT EMPTY CHECK IF PRODUCT EXIST
        //idexFound === -1 if it does not exist
        //idexFound === 1 if it exist
        //If item already exist in cart, increment its quantity by 1
        if (indexFound !== -1) {
            //----------check if product exist,just add the previous quantity with the new quantity and update the total price-------

            cart.items[indexFound].quantity = cart.items[indexFound].quantity + quantity;
            cart.items[indexFound].total = cart.items[indexFound].quantity * productDetails[size];
            cart.items[indexFound].price = productDetails[size];
            cart.items[indexFound].colors = color;

            cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
            
            let data = await cart.save();
            res.status(200).json({cart: data })
        }

        //If indexFound === -1 
        //Add an item to the items array of the user
        if(indexFound === -1) {
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
            
            let data = await cart.save();
            res.status(200).json({cart: data })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: error.message });
    }
}




exports.removeFromCart = async (req, res, next) => {
    //http://localhost:2000/api/product/remove-from-cart
    const owner = req.user.id;
    // const owner = "628695d03cf50a6e1a34e27b";

    let { productId, size,  color } = req.body;

      let  quantity = Number.parseInt(1);

    let keyName = Object.keys({ size, quantity }).join(" ");

    
    try {
    
        const productDetails  = await ProductModel.findById(productId);

        const carts = await CartModel.find({ owner: owner }).populate({
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

    const owner = req.user.id;
    // const owner = "628695d03cf50a6e1a34e27b";

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
  const owner = req.user.id;
//   const owner = "628695d03cf50a6e1a34e27b";

  let { productId } = req.body;

    let  quantity = Number.parseInt(1);

    let keyName = Object.keys({ size, quantity }).join(" ");

  try {
  
      const productDetails  = await ProductModel.findById(productId);

      const carts = await CartModel.find({ owner: owner}).populate({
          path: "items.productId",
          select: `${keyName} name total, colors images`
      });

        const cart = carts[0];

        if(!carts || carts.length === 0) return res.status(400).send({ error: "No item in cart"})

        if(!cart) return res.status(400).send({ error: "Cart is empty"});

        // cart.items = [];
        // cart.subTotal = 0
        //let data = await cart.save();
        const clearedCart = await cart.remove();

        if(!clearedCart) return res.status(400).send({ error: "Unable to clear cart"})

        return res.status(200).json({ success: "Cart cleared" });
    } catch (error) {
       
        res.status(500).json({ error: error.message });
    }
}


exports.checkout = async (req, res, next) => {
    //http://localhost:2000/api/product/checkout
    const { product, stripToken: token } = req.body;
    
    try {
          const customer =  await stripe.customers.create({
                source:token.id,
                email: token.email,
                });
                
          const charge = await stripe.charges.create({
                amount: product.price * 100,
                currency: "usd",
                customer: customer.id,
                receipt_email: token.email,
                description: `Purchased the ${product.description}`,
          });

          return res.status(200).send({customer:customer, charge: charge});

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}