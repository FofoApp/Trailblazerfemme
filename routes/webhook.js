
const express = require('express')
const Stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router()


router.post('/webhook',  express.raw({ type: 'application/json' }), async (req, res) => {
    console.log({ STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY })
    let endPointSecret;

    //  = process.env.STRIPE_SIGNIN_SECRET;

    const payload = req.body;
    let eventType = null;
    let data;

    console.log({ STRIPE_SIGNIN_SECRET: process.env.STRIPE_SIGNIN_SECRET });

    if(endPointSecret) {
      const signature = req.headers['stripe-signature'];
      let event = req.body;
  
      try {
  
        event = Stripe.webhooks.constructEvent(req.body, signature, endPointSecret);
    
        data = event.data.object;
        eventType = event.type;
  
        console.log({ firstEventTyppe: eventType })
        console.log({ firstData: data })
      
      } catch (error) {
        console.log(` Webhook signature verification failed.`, error);
        res.status(400).send(`Webhook Error: ${error.message}`);
        return;
      }
      
    } else {
      data = req.body.data.object;
      eventType = req.body.type;
    }
  

  
    if(eventType === "checkout.session.completed") {
      console.log({ eventType })
      console.log({ data })
      // Stripe.subscriptions
      // .retrieve(data.customer)
      // .then(async (customer) => {
      //   try {
      //     console.log("Ordered");
      //     console.log("Customer details:", customer, data)
      //     res.status(200).json({ message: 'Order created', data: data })
      //     res.status(200).send("Order created")
      //   } catch (err) {
  
      //     console.log(err);
      //   }
      // })
      // .catch((err) => console.log(err.message));
  
    } else {
      console.log("An error occured")
    }
  
  
  
  });


module.exports = router;