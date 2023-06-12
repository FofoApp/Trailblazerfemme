const express = require('express')

const Stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: process.env.STRIPE_API_VERSION,
});

const moment = require('moment');
const MembershipSubscriber = require('./../models/membershipModel/MembershipSubscribersModel')
const UserModel = require('./../models/UserModel');
const Order = require('../models/productModel/orderModel');
const router = express.Router();

router.post('/webhook', async (req, res) => {

    let endPointSecret = process.env.STRIPE_SIGNIN_SECRET;

    const payload = req.body;

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


    const object = data.object;
  
    // Monitor payment_intent.succeeded & payment_intent.payment_failed events.
    if (object.object === 'payment_intent') {

      const paymentIntent = object;

      if (eventType === 'payment_intent.succeeded') {

        console.log(`🔔  Webhook received! Payment for PaymentIntent ${paymentIntent.id} succeeded.`);

      } else if (eventType === 'payment_intent.payment_failed') {
        
        const paymentSourceOrMethod = paymentIntent.last_payment_error.payment_method
          ? paymentIntent.last_payment_error.payment_method
          : paymentIntent.last_payment_error.source;

        console.log(`🔔  Webhook received! Payment on ${paymentSourceOrMethod.object} ${paymentSourceOrMethod.id} of type ${paymentSourceOrMethod.type} for PaymentIntent ${paymentIntent.id} failed.`);
     
      }

    }
  
    // Monitor `source.chargeable` events.
    if (object.object === 'source' && object.status === 'chargeable' && object.metadata.paymentIntent ) {
      
        const source = object;

       console.log({ metadata: source })

       console.log(`🔔  Webhook received! The source ${source.id} is chargeable.`);

      // Find the corresponding PaymentIntent this source is for by looking in its metadata.
      const paymentIntent = await Stripe.paymentIntents.retrieve(source.metadata.paymentIntent);
      // Check whether this PaymentIntent requires a source.
      if (paymentIntent.status != 'requires_payment_method') {
        return res.sendStatus(403);
      }

      // Confirm the PaymentIntent with the chargeable source.
        await Stripe.paymentIntents.confirm(paymentIntent.id, {source: source.id});
    }
  
    // Monitor `source.failed` and `source.canceled` events.
    if ( object.object === 'source' && ['failed', 'canceled'].includes(object.status) && object.metadata.paymentIntent) {
      
        const source = object;

      console.log(`🔔  The source ${source.id} failed or timed out.`);
      // Cancel the PaymentIntent.
      await Stripe.paymentIntents.cancel(source.metadata.paymentIntent);
    }
  
    // Return a 200 success code to Stripe.
    res.sendStatus(200);

  });


module.exports = router;
  