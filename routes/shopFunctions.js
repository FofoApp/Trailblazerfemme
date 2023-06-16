
const Order = require('../models/productModel/orderModel');

exports.shopWebhookFunction = async (eventType, customer, object) => {


  const paymentIntent = object;
  const paymentIntentId = object?.id;

  console.log({ metadata: customer?.metadata })
    
  console.log('PaymentIntent was successful!');

          const {
            product,
            shippingAddress, 
            taxPrice,
            shippingPrice,
            totalPrice,
            itemsPrice,
            payment_date,
            userEmail,
            userId,
            
        } = object?.metadata;

        const newOrderItems = JSON.parse(product)
        const newAddress = JSON.parse(shippingAddress);

        const order_details = {
            user: userId,
            orderItems: newOrderItems,
            shippingAddress: newAddress,

            paymentMethod: "Stripe",
            paymentIntentId,

            paymentResult: {
              paymentIntentId: paymentIntentId,
              status: "paid",
              update_time: new Date(),
            },

            userEmail,
            taxPrice,
            shippingPrice,
            itemsPrice: Number(itemsPrice) || 0,
            totalPrice: Number(totalPrice),
            payment_date,
            isPaid: true,
            paidAt: new Date(),
            isDelivered: false,
            
          }

          try {

              const order = await Order.create(order_details);

              if(!order) {
                return res.status(400)
              }

              console.log({ order });

          } catch (error) {
            console.log(error);
          }





}