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


    if(eventType === 'checkout.session.completed') {

        try {

          const customer = await  Stripe.customers.retrieve(data?.customer);
          
          await membershipWebhookFunction(eventType, customer, data);

        } catch (error) {
          console.log(error)
        }


    }


    // if(eventAction === 'shop') {

    //   if (data.payment_status === 'paid') {
    //     console.log("Shop Paid")
    //     await shopWebhookFunction(eventType, data);
    //   }

    // } else if(eventAction === 'membership') {

    //   membershipWebhookFunction(eventType, data)
    // }

    console.log(eventType);

    res.end(); 

});

module.exports = router;
  