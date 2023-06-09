
const express = require('express')
const Stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router()


router.post('/webhook',  express.raw({ type: 'application/json' }), async (req, res) => {
    console.log({ signInSecret: process.env.STRIPE_SECRET_KEY })
    let endPointSecret = process.env.STRIPE_SIGNIN_SECRET;

    const payload = req.body;
    let eventType = null;
    let data;
    
    console.log({ signInSecret: process.env.STRIPE_SIGNIN_SECRET });

    if(endPointSecret) {
      const signature = request.headers['stripe-signature'];
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
  
    console.log({ eventType })
  
    if(eventType === "checkout.session.completed") {
  
      Stripe.customers
      .retrieve(data.customer)
      .then(async (customer) => {
        try {
          // CREATE ORDER
          // createOrder(customer, data);
          console.log("Ordered");
          console.log("Customer details:", customer, data)
          res.status(200).json({ message: 'Order created', data: data })
          res.status(200).send("Order created")
        } catch (err) {
  
          console.log(err);
        }
      })
      .catch((err) => console.log(err.message));
  
    }
  
  
  
  });


module.exports = router;