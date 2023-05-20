const mongoose = require('mongoose')
const  Order = require('../../models/productModel/orderModel')

exports.addOrderItem = async(req, res) => {

    console.log("I am  here")

    // const keyword = req.query.search
    //                 ? {
    //                     $or: [
    //                         { 
    //                             name: { $regex: '.*' + req.query.search + '.*', $options: 'i' },
    //                             title: { $regex: '.*' + req.query.title + '.*', $options: 'i' },
    //                         }
    //                     ],
    //                     $and: [                          
    //                        { _id: { $ne: req.user.id } }
    //                     ]
    //                 } 
    //                 : {}
    // const order = await Order.find(keyword)
     
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice, productId } = req.body
        // return res.status(400).json(req.body)
        if(orderItems && orderItems.length === 0) {
           return res.status(400).json({ error: "No order items" })
        }

        

        const order = new Order(
            {  
                orderItems,
                user: req.user.id,
                shippingAddress, 
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice
        } )

        const createdOrder = await order.save()

        if(!createdOrder ) {

            return res.status(400).json({ error: "Order not added"}) 
        }

        return res.status(201).json({status: "success", order: createdOrder, message: "Order created successfully" })

    } catch (error) {
        return res.status(500).json({status: "failed", message: error?.message, error: error?.message }) 
    }
}



exports.getMyOrders = async(req, res) => {

    const loggedInUser = req?.user?.id;

    const DEFAULT_PAGE = 1;
    const DEFAULT_SIZE = 5;

    let { page = DEFAULT_PAGE, size = DEFAULT_SIZE } = req.query;

    page = Number(page);
    size = Number(size);

    try {

        if(!mongoose.Types.ObjectId.isValid(req.user.id)) {
            return res.status(400).json({ status: "failed", message: "Invalid user ID", error: "Invalid user ID"});
        }

        const orders = await Order.paginate({ user: loggedInUser },
        {
            page,
            limit: size,
            sort: [
                [{ _id: 1, createdAt: -1 }]
            ],
        });


        if(!orders) {
            return res.status(404).json({ status: "failed", message: "Order not found", error: "Order not found" })
        }

        return res.status(200).json({ orders })

    } catch(error) {
        return res.status(500).json({ status: "failed", message: error?.message, error: error?.message })
    }

}
