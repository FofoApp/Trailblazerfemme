const express = require('express')
const moment = require('moment');
const MembershipSubscriber = require('./../models/membershipModel/MembershipSubscribersModel')
const User = require('./../models/UserModel');

const Stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: process.env.STRIPE_API_VERSION,
});

// const { 
//     monitorPaymentIntentSucceed, 
//     monitorPaymentSourceChargeable, 
//     monitorFailedPayment 
// } = require('./paymentHelpers');
const { shopWebhookFunction } = require('./shopFunctions');
const { membershipWebhookFunction } = require('./membershipFunctions');
const router = express.Router();



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
      data = event?.data?.object;
      eventType = event?.type;

    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = req?.body?.data?.object;
      eventType = req?.body?.type;

    }

    // console.log(data)

    const eventAction = data?.metadata?.action;
    const paymentIntentId = data?.id;

    // payment_intent.succeeded
    // checkout.session.completed
    if(eventType === 'payment_intent.succeeded') {

        try {
          
          const customer = await  Stripe.customers.retrieve(data?.customer);

          // console.log({ customer })

          if(eventAction?.toLowerCase() === 'membership') {

            await membershipWebhookFunction(eventType, customer, data);

          } else if(eventAction?.toLowerCase() === 'shop'){

            await shopWebhookFunction(eventType, customer, data);

          }
          

        } catch (error) {
          console.log(error)
        }


    }


    console.log(eventType);

    res.status(200).end(); 

});

module.exports = router;
  