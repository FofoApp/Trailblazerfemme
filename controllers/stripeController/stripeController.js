require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)



exports.stripeCheckout = async (req, res) => {
    
    // const completeUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    // const success_url = `${req.headers.origin}/?success=true`;
    // const cancel_url = `${req.headers.origin}/?canceled=true`;\
    //CLI_ACCOUNT_ID = acct_1Kzz4mBSyohQ7ttb

    const customer = await stripe.customers.create({
        metadata: {
            userId: "req.user.id",
            membership_details: JSON.stringify(req.body.products)
        }
    })

    const line_items = req.body.products.map((sub) => {
        return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: sub.name,
                description: sub.desc,
                // images: [sub.image],
                metadata: { id: sub.memId, }
              },
              unit_amount: sub.price * 100,
            },

            quantity: 1,

          }
    } )
    try {

        const session = await stripe.checkout.sessions.create({

            payment_method_types: ['card'],
            shipping_address_collection: {allowed_countries: ['US', 'CA']},
            shipping_options: [
              {
                shipping_rate_data: {
                  fixed_amount: {amount: 0, currency: 'usd'},
                  display_name: 'FOFO APP',
                  delivery_estimate: {
                    minimum: {unit: 'business_day', value: 5},
                    maximum: {unit: 'business_day', value: 7},
                  },
                },
              },
            ],
          phone_number_collection: { enabled: true },
          customer: customer.id,
          line_items,
          mode: 'payment',
          success_url: `${process.env.CLIENT_URL}/success`,
          cancel_url: `${process.env.CLIENT_URL}/cancel`,
        });
      
         res.json({ url: session.url });


    } catch (error) {
        return res.status(500).json({ error: error })
    }
  }





const createOrder = async (customer, data) => {
    const membership = JSON.parse(customer.metadata.membership_details)
    // const new_membership = new Membership.create({
    //     userId: customer.metadata.userId,
    //     customerId: data.customer,
    //     paymentIntentId: customer.payment_intent,
    //     membership: membership,
    //     subtotal: data.amount_subtotal,
    //     total: data.amount_total,
    //     shipping: data.customer_details,
    //     payment_status: data.payment_status
    // })

    try {
        // const saved_membership = await new_membership.save()

        // return res.status(201).send({ saved_membership })

    } catch (error) {
        console.log(error)
    }
}

// This is your Stripe CLI webhook secret for testing your endpoint locally.



exports.webhooks = async (req, res) => {
  console.log("I AM HERE")
    const sig = req.headers['stripe-signature'];
    let endpointSecret

    endpointSecret = "whsec_c469ebeaa230cc07e4a1a3fdb9968ae98c6cb609f9f64fad44a827f2dc83338d";
    let event;
    let data
    let eventType

    if(endpointSecret) {  
        try {
          // const payload = req.rawBody
          const payload = req.body
          event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
          
          console.log('Webhook verified', event)
          // createOrder(customer, data)
    
        } catch (err) {
            console.log(`Webhook Error: ${err.message}`)
            res.status(400).send(`Webhook Error: ${err.message}`);

          return;
        }

        data = req.body.data.object
        eventType = req.body.data.type

        if(event?.type === 'checkout.session.completed') {
            stripe.customers.retrieve(data.customer)
            .then((customer) => {
                const metadata = event?.data?.object?.metadata
                const payment_status = event?.data?.metadata
                console.log("customer::", customer)
                console.log("data::", metadata)

            }).catch((error) => {
                console.log(error.message)
            })
        }

    } else {
        
        data = req.body.data.object
        eventType = req.body.data.type
    }


  
    // // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log(event.data.object)
        const paymentIntent = event.data.object;
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  
    // Return a 200 response to acknowledge receipt of the event

    return res.status(400).end();

}

