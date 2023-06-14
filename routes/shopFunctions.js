
const Order = require('../models/productModel/orderModel');

exports.shopWebhookFunction = async (eventType, object) => {

    const paymentIntent = object;
    const paymentIntentId = object?.id;

        switch (eventType) {
            case 'payment_intent.succeeded':

            //   const paymentIntent = event.data.object;              
              console.log('PaymentIntent was successful!');

              const {
                product,
                shippingAddress, 
                taxPrice,
                shippingPrice,
                totalPrice,
                itemsPrice,
                payment_date,

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
                  update_time: new Date(Date.now()),
                },
      
      
                taxPrice,
                shippingPrice,
                itemsPrice: Number(itemsPrice) || 0,
                totalPrice: Number(totalPrice),
                payment_date,
                isPaid: true,
                paidAt: new Date(Date.now()),
                isDelivered: false,
              }

              const order = await Order.create(order_details);

              if(!order) {
                return res.status(400)
              }

              console.log({ order })

              break;
            case 'payment_method.attached':
            //   const paymentMethod = event.data.object;
              console.log('PaymentMethod was attached to a Customer!');
              break;
            // ... handle other event types
            default:
              console.log(`Unhandled event type ${eventType}`);
    }


}