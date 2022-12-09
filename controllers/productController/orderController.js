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
        return res.status(400).json(req.body)
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

        return res.status(201).json({ order: createdOrder, message: "Order created successfully" })

    } catch (error) {
        return res.status(500).json({ error: error.message }) 
    }
}



exports.getMyOrders = async(req, res) => {

    const orders = await Order.find({ user: req.user._id })

    if(!orders) {
        return res.status(404).json({ error: "Order not found" })

    }

    return res.status(200).json({ orders })

}
