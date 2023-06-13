const express = require('express')

const Stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: process.env.STRIPE_API_VERSION,
});

const moment = require('moment');
const MembershipSubscriber = require('./../models/membershipModel/MembershipSubscribersModel')
const UserModel = require('./../models/UserModel');
const Order = require('../models/productModel/orderModel');
const router = express.Router();

const monitorPaymentIntentSucceed = async (object) => {
    
    if (object.object === 'payment_intent') {

        const paymentIntent = object;
  
        if (eventType === 'payment_intent.succeeded' && object?.status === 'succeeded') {
           
            console.log(object)

            if(metadata.action === 'shop'){
                const {
                    product,
                    shippingAddress, 
                    taxPrice,
                    shippingPrice,
                    totalPrice,
                    itemsPrice,
                    payment_date,
                } = object.metadata;

               // Update user records and membership account

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

              console.log({order})

            } else if(metadata.action === 'membership') {
                console.log(object)
                // Update user records and membership account
                const subType = mode === 'yearly' ? 'years' : "months";
                const days = 'days';
                const start_date = moment();
                const end_date = moment().add(1, subType);

                const diff = end_date.diff(start_date, days);

                // const diff = user?.subscription_end_date.diff(user?.subscription_start_date, days);
          let  membership_data = {
                mode,
                membershipType,
                membershipId,
                // subscriptionId is the membership mongoose ID
                stripeSubscriptionId: paymentIntentId,
                userId,
                receipt_email,
                isActive: true,
                isPaid: true,
                amount: Number(amount),
                subscription_start_date: start_date,
                subscription_end_date: end_date,
                days_between_next_payment: diff,
                paymentIntentId: paymentIntentId,
            }

          const create_new_subscriber = new MembershipSubscriber(membership_data);
          const save_new_subscriber = await create_new_subscriber.save();

          const updateUser = await UserModel.findByIdAndUpdate(membership_data?.userId,
              {
                "$set": {
                    "subscriptionId": save_new_subscriber?.id,
                    "paid": save_new_subscriber?.isPaid,
                    "mode": save_new_subscriber?.mode,
                    "isActive": save_new_subscriber?.isActive,
                    "isMembershipActive": save_new_subscriber?.isActive,
                    "membershipName": save_new_subscriber?.membershipType,
                    "membershipType": save_new_subscriber?.membershipType,
                    "amount": save_new_subscriber?.amount,
                    "subscription_end_date": save_new_subscriber?.subscription_end_date,
                    "subscription_start_date": save_new_subscriber?.subscription_start_date,
                    "days_between_next_payment": save_new_subscriber?.days_between_next_payment,
                    "paymentIntentId": save_new_subscriber?.paymentIntentId,
                },
  
                "$addToSet": {  "membershipSubscriberId": save_new_subscriber?.id,  }
            }, { new: true  });
  
            console.log({name: "updateUser collection", updateUser})


            }
          
          console.log(`🔔  Webhook received! Payment for PaymentIntent ${paymentIntent.id} succeeded.`);
  
        } else if (eventType === 'payment_intent.payment_failed') {
          
          const paymentSourceOrMethod = paymentIntent.last_payment_error.payment_method
            ? paymentIntent.last_payment_error.payment_method
            : paymentIntent.last_payment_error.source;
  
          console.log(`🔔  Webhook received! Payment on ${paymentSourceOrMethod.object} ${paymentSourceOrMethod.id} of type ${paymentSourceOrMethod.type} for PaymentIntent ${paymentIntent.id} failed.`);
       
        }
  
      }
}

  const monitorPaymentSourceChargeable = async (object) => {
    
    if (object.object === 'source' && object.status === 'chargeable' && object.metadata.paymentIntent ) {
      
      const source = object;

       console.log(`🔔  Webhook received! The source ${object.id} is chargeable.`);

      // Find the corresponding PaymentIntent this source is for by looking in its metadata.
      const paymentIntent = await Stripe.paymentIntents.retrieve(object.metadata.paymentIntent);
      // Check whether this PaymentIntent requires a source.

      if (paymentIntent.status != 'requires_payment_method') {
        return res.sendStatus(403);
      }

      // Confirm the PaymentIntent with the chargeable source.
      await Stripe.paymentIntents.confirm(paymentIntent.id, {source: object.id});

    }


}

  const monitorFailedPayment = async (object) => {
    
    if ( object.object === 'source' && ['failed', 'canceled'].includes(object.status) && object.metadata.paymentIntent) {
            
          console.log(`🔔  The source ${object.id} failed or timed out.`);
          // Cancel the PaymentIntent.
          await Stripe.paymentIntents.cancel(object.metadata.paymentIntent);
    }

}

router.post('/webhook', async (req, res) => {

    let endPointSecret = process.env.STRIPE_SIGNIN_SECRET;

    let eventType;

    let data;

    // Check if webhook signing is configured.
    if (endPointSecret) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      
      let event;
      const signature = req.headers['stripe-signature'];


      try {

        event = Stripe.webhooks.constructEvent(req.rawBody, signature, endPointSecret);

      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`);
        return res.sendStatus(400);
      }
      // Extract the object from the event.
      data = event.data;
      eventType = event.type;

    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = req.body.data;
      eventType = req.body.type;

    }

    const object = data.object
    const eventAction = object?.metadata?.action;


    switch(eventAction) {
        case 'shop':
            // shop actions
            const {
              product,
              shippingAddress, 
              taxPrice,
              shippingPrice,
              totalPrice,
              itemsPrice,
              payment_date,
          } = object.metadata;

            // Monitor payment_intent.succeeded & payment_intent.payment_failed events.
            monitorPaymentIntentSucceed(object)
        
            // Monitor `source.chargeable` events.
            monitorPaymentSourceChargeable(object);
        
            // Monitor `source.failed` and `source.canceled` events.
            monitorFailedPayment(object);



        break;

        case 'membership':
            // shop actions

            // Monitor payment_intent.succeeded & payment_intent.payment_failed events.
            monitorPaymentIntentSucceed(object)
        
            // Monitor `source.chargeable` events.
            monitorPaymentSourceChargeable(object);
        
            // Monitor `source.failed` and `source.canceled` events.
            monitorFailedPayment(object);            
        break;

        default:

            console.log(`Unhandled event type ${ eventType }`);
    }

    // Return a 200 success code to Stripe.
    res.sendStatus(200);

});

module.exports = router;
  