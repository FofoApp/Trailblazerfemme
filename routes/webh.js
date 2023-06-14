const express = require('express')

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

    const eventAction = data?.metadata?.action;


    if(eventAction === 'shop') {
      await shopWebhookFunction(eventType, data);
    } else if(eventAction === 'membership') {
      await membershipWebhookFunction(eventType, data);
    }





























    console.log(eventType)

    // switch(eventAction) {
    //     case 'shop':
          // shop actions
          // console.log("SHOP ACTION:::::::")
          // Monitor payment_intent.succeeded & payment_intent.payment_failed events.
          //  monitorPaymentIntentSucceed(eventAction, data);
      
          // Monitor `source.chargeable` events.
          //  monitorPaymentSourceChargeable(eventAction, data);
      
          // Monitor `source.failed` and `source.canceled` events.
          //  monitorFailedPayment(eventAction, data);

        // break;

        // case 'membership':
          // shop actions

          // Monitor payment_intent.succeeded & payment_intent.payment_failed events.
            // monitorPaymentIntentSucceed(eventType, data);
        
            // Monitor `source.chargeable` events.
          //  monitorPaymentSourceChargeable(eventType, data);
        
            // Monitor `source.failed` and `source.canceled` events.
          //  monitorFailedPayment(eventType, data);

    //     break;

    //     default:

    //         console.log(`Unhandled event type ${ eventType }`);
    // }

    // Return a 200 success code to Stripe.
    res.sendStatus(200);

});

module.exports = router;
  