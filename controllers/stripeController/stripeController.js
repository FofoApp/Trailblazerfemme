require('dotenv').config()
const mongoose = require('mongoose')
const moment = require('moment');
const Membership = require('../../models/adminModel/AdminMembershipModel');
const MembershipSubscriber = require('../../models/membershipModel/MembershipSubscribersModel');

const Order = require('../../models/productModel/orderModel');
const User = require('../../models/UserModel');

const Stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.stripeCheckout = async (req, res) => {

    const {id: userId, email } = req?.user;
    const { orderItems, shippingAddress, taxPrice, shippingPrice, itemsPrice, totalPrice } = req.body;

    // const completeUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    // const success_url = `${req.headers.origin}/?success=true`;
    // const cancel_url = `${req.headers.origin}/?canceled=true`;

    // const customer = await Stripe.customers.create({
    //     metadata: {
    //         userId: "req.user.id",
    //         membership_details: JSON.stringify(req.body.products)
    //     }
    // })

    const line_items = orderItems?.map((item) => {

        return {
            price_data: {
              currency: 'usd',
              unit_amount: Number(item?.price)  * 100,
              product_data: {
                name: item?.name,
                description: item?.desc,
                // images: [item.image],
              },
              
            },
            quantity: item?.qty,

          }
    } )


    try {

        const session = await Stripe.checkout.sessions.create({

        payment_method_types: ['card'],

          //   shipping_address_collection: { allowed_countries: ['US', 'CA'] },
          //   shipping_options: [
          //     {
          //       shipping_rate_data: {
          //         fixed_amount: { amount: 0, currency: 'usd' },
          //         display_name: 'FOFO APP',
          //         delivery_estimate: {
          //           minimum: {unit: 'business_day', value: 5},
          //           maximum: {unit: 'business_day', value: 7},
          //         },
          //       },
          //     },
          //   ],
          // phone_number_collection: { enabled: true },
          // customer: customer.id,

          line_items,
          mode: 'payment',
          customer_email: email,

           metadata: {
            "product": JSON.stringify(orderItems),
            "shippingAddress": JSON.stringify(shippingAddress),
            "taxPrice": taxPrice,
            "shippingPrice": shippingPrice,
            "itemsPrice": itemsPrice,
            "totalPrice": totalPrice,
            userId,
            action: "shop",
            integration_check: 'accept_a_payment',
            payment_date: new Date(Date.now()),
        },


          success_url: `${process.env.CLIENT_URL}/?success=true`,
          cancel_url: `${process.env.CLIENT_URL}/?canceled=true`,

          // success_url: `https://6469ec122631c1598c5d449c--leafy-paprenjak-6ddfe1.netlify.app/?success=true`,
          // cancel_url: `https://6469ec122631c1598c5d449c--leafy-paprenjak-6ddfe1.netlify.app/?canceled=true`,
          
        });
      
         return res.send({ url: session.url }); 


    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error })
    }
  }


  exports.membershipPayment = async (req, res) => {

    const { membership: subMembership } = req.body
    const userId = req?.user?.id;
    console.log(subMembership)
    const membershipId = subMembership?.membershipId;

    try {

        if(!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(401).send({ error: "Invalid user"});
        }
 
        if(!mongoose.Types.ObjectId.isValid(membershipId)) {
          return res.status(400).send({ error: "Invalid membership"});
        }

        let user = await User.findById(userId);
        
        if(!user) return res.status(404).send({ error: "Invalid user"});

        let membership = await Membership.findById(membershipId);
        
        if(!membership) {
          return res.status(404).send({ error: "Invalid membership"});
        }

        const subscriber = await MembershipSubscriber.findOne({ userId: userId, isActive: true });

        const isIncludesFreeMembership = subscriber?.membershipType.split(",").includes('Free');

        const isBefore = moment().isBefore(subscriber?.subscription_end_date);
           
        // if(subscriber?.userId.toString() === userId.toString() && !isIncludesFreeMembership && isBefore && subscriber?.isActive === true ) {
      
        //     return res.status(400).send({ error: "You still have an active plan"});
        // }

          const session = await Stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: { 
                currency: "usd",
                product_data: {
                  name: membership?.name,
                  description: membership?.description,
                },
                unit_amount: Number(membership?.amount) * 100,
              },
              quantity: 1,
            }, 
          ],
          mode: "payment",

          metadata: {
            userId,
            membershipId: subMembership?.id,
            membershipType: subMembership?.membershipType,
            mode: subMembership?.mode,
            amount: Number(membership?.amount),
            action: "membership"
          },

          // success_url: `${process.env.CLIENT_URL}/?success=true`,
          // cancel_url: `${process.env.CLIENT_URL}/?canceled=true`,

          // success_url: `https://calm-lime-goldfish-tutu.cyclic.app/api/stripe/payment_success/?success=true`,
          // cancel_url: `https://calm-lime-goldfish-tutu.cyclic.app/api/stripe/payment_canceled/?canceled=true`,
        
          success_url: `http://localhost:2000/api/stripe/payment_success/?success=true`,
          cancel_url: `http://localhost:2000/api/stripe/payment_canceled/?canceled=true`,

        });

    res.send({ url: session.url })
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: error?.message })

    }
  }


//let endPointSecret  = process.env.STRIPE_WEBHOOK_ENDPOINT;

exports.hooks = async (req, res) => {
  let endPointSecret;
  const payload = req.body;
  let eventType = null;
  let data;

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



}



// {
//   "callback_url": "https://trailblazerfemme-app.onrender.com/",
//   "success_redirect_url": "https://trailblazerfemme-app.onrender.com/",
//   "fail_redirect_url": "https://trailblazerfemme-app.onrender.com/",
//   "channel": "sms",
//   "phone_sms": "+23465066382",
//   "phone_voice": "",
//   "email": "olawumi.olusegun@gmail.com",
//   "hide": false,
//   "metadata": "",
//   "captcha": false,
//   "lang": "",
//   "embed": ""
// }