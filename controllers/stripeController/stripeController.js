require('dotenv').config()
const mongoose = require('mongoose')
const moment = require('moment');
const Membership = require('../../models/adminModel/AdminMembershipModel');
const MembershipSubscriber = require('../../models/membershipModel/MembershipSubscribersModel');

const Order = require('../../models/productModel/orderModel');
const User = require('../../models/UserModel');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.stripeCheckout = async (req, res) => {

    const {id: userId, email } = req?.user;
    const { orderItems, shippingAddress, taxPrice, shippingPrice, itemsPrice, totalPrice } = req.body;

    // const completeUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    // const success_url = `${req.headers.origin}/?success=true`;
    // const cancel_url = `${req.headers.origin}/?canceled=true`;

    // const customer = await stripe.customers.create({
    //     metadata: {
    //         userId: "req.user.id",
    //         membership_details: JSON.stringify(req.body.products)
    //     }
    // })

 

 
    // console.log(orderItems, shippingAddress, taxPrice, shippingPrice, itemsPrice, totalPrice)
    const line_items = orderItems?.map((item) => {

        return {
            price_data: {
              currency: 'usd',
              unit_amount: item.price * 100,
              product_data: {
                name: item.name,
                description: item.desc,
                // images: [item.image],
              },
              
            },
            quantity: item.qty,

          }
    } )


    try {

      // const order_details = {
      //   user: userId,
      //   orderItems: orderItems,
      //   shippingAddress: shippingAddress,

      //   taxPrice,
      //   shippingPrice,
      //   itemsPrice,
      //   totalPrice,
      //   isPaid: false,
      //   paidAt: Date.now(),
      //   isDelivered: false

      // }

      // const order = await Order.create(order_details)

        const session = await stripe.checkout.sessions.create({

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
          // metadata: { 
          //   orderId: order._id.toString(),
          //   action: "shop"
          //  },

           metadata: {
            // "orderId": order._id.toString(),
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
          
        });
      
         return res.send({ url: session.url }); 


    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error })
    }
  }


  exports.membershipPayment = async (req, res) => {

    const { membership_data } = req.body

    const userId = req?.user?.id.toString()
    const membershipId = membership_data?.memId

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
        
        if(!membership) return res.status(404).send({ error: "Invalid membership"});

        const subscriber = await MembershipSubscriber.findOne({ userId: userId, isActive: true });

        const isIncludesFreeMembership = subscriber?.membershipType.split(",").includes('Free')

        const isBefore = moment().isBefore(subscriber?.subscription_end_date);
           
        if(subscriber?.userId.toString() === userId.toString() && !isIncludesFreeMembership && isBefore && subscriber?.isActive === true ) {
      
            return res.status(400).send({ error: "You still have an active plan"});
        }

          const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: { 
                currency: "usd",
                product_data: {
                  name: membership_data.name,
                  description: membership_data.desc,
                },
                unit_amount: membership_data.price * 100,
              },
              quantity: 1, 
            }, 
          ], 
          mode: "payment",

          metadata: {
            userId: req?.user?.id.toString(),
            membershipId: membership_data?.memId.toString(),
            membershipType: membership_data?.name,
            mode: membership_data?.mode,
            price: membership_data?.price,
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

      return res.status(500).json({ error: error?.message })

    }
  }



exports.hooks = async (req, res) => {

  const signinSecret = process.env.STRIPE_WEBHOOK_ENDPOINT
  const payload = req.body;
  const sig = req.headers['stripe-signature']

  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

  // console.log(fullUrl)

  let event;

  try {

    event = stripe.webhooks.constructEvent(payload, sig, signinSecret)
        
  } catch (error) {
      return res.status(400).json({ status: "failed", success: false })
      
  }



  switch(event?.data?.object?.metadata?.action) {

    case 'shop':
      if(event?.type === 'checkout.session.completed') {

        const {
          product,
          shippingAddress, 
          taxPrice,
          shippingPrice,
          userId,
          totalPrice,
          itemsPrice,
          payment_date,

      } = event.data.object.metadata

      const paymentStatus = event?.data?.object?.payment_status;
  
      if(event?.data?.object?.metadata && paymentStatus === 'paid') {
  
        const paymentIntentId = event?.data?.object?.payment_intent;
    
        const orderId = event?.data?.object?.metadata?.orderId
        const newOrderItems = JSON.parse(product)
        const newAddress = JSON.parse(shippingAddress);

        const order_details = {
          user: userId,
          orderItems: newOrderItems,
          shippingAddress: newAddress,

          paymentMethod: "Stripe",
          paymentIntentId,

          paymentResult: {
            id: paymentIntentId,
            status: "paid",
            update_time: new Date(Date.now()),
          },


          taxPrice,
          shippingPrice,
          itemsPrice,
          totalPrice,
          payment_date,
          isPaid: true,
          paidAt: new Date(Date.now()),
          isDelivered: false,
          orderId,
        }
  
        const order = await Order.create(order_details);

      }

      
      // res.status(201).send({ stage: 4, message: "Payment successfull" })
      return res.end()
  
    }
  
    break;

    case 'membership':

      if(event?.type === 'payment_intent.succeeded') {

        const { userId, price, membershipType, mode, membershipId, receipt_email  } = event.data.object.metadata;
        
        const paymentStatus = event?.data?.object?.payment_status;
    
        if(event?.data?.object?.metadata?.membershipId && paymentStatus === 'paid') {
    
          const paymentIntentId = event?.data?.object?.payment_intent;
          //yearly or monthly
          const annually = mode === 'yearly' ? 'years' : "months";
          // const monthly = 'months';

         const days = 'days';
    
          const start_date = moment();
          const end_date = moment().add(1, annually);
          const diff = end_date.diff(start_date, days);
    
         let  membership_data =   {
                  mode,
                  membershipType: membershipType,
                  membershipId: membershipId,
                  // subscriptionId is the membership mongoose ID
                  subscriptionId: paymentIntentId,
                  userId,
                  receipt_email,
                  isActive: true,
                  isPaid: true,
                  amount: price,
                  subscription_start_date: start_date,
                  subscription_end_date: end_date,
                  days_between_next_payment: diff,
                  paymentIntentId: paymentIntentId,
          }
    

          const create_new_subscriber = new MembershipSubscriber(membership_data);
          const save_new_subscriber = await create_new_subscriber.save();

          const updateUser = await User.findByIdAndUpdate(userId,
            {
              "$set": {
                  "subscriptionId": save_new_subscriber?.id,
                  "isPaid": save_new_subscriber?.isPaid,
                  "mode": save_new_subscriber?.mode,
                  "isActive": save_new_subscriber?.isActive,
                  "isMembershipActive": save_new_subscriber?.isActive,
                  "membershipName": save_new_subscriber?.membershipType,
                  "membershipType": save_new_subscriber?.membershipType,
                  "amount": save_new_subscriber?.amount,
                  "subscription_end_date": save_new_subscriber?.subscription_end_date,
                  "subscription_start_date": save_new_subscriber?.subscription_end_date,
                  "days_between_next_payment": save_new_subscriber?.subscription_end_date,
                  "paymentIntentId": save_new_subscriber?.paymentIntentId,
              },

              "$addToSet": {  "membershipSubscriberId": save_new_subscriber?.id,  }
          },
          { new: true  });
          // { "new": true, "upsert": true },

          // console.log({ updateUser })

          // req.membershipId = membershipId;
          // req.userId = userId;

          // res.status(201).send({ stage: 4,  message: "Payment successfull" })
          // res.end()
        
        }
    
      }

    break;

    default:
      console.log(`Unhandled event type ${ event.type }`);
  }


  // res.status(201).send({ stage: 4, message: "Membership subscription successful" })
  res.status(200).end()

}


exports.paymentSuccess = async (req, res, next) =>{

  const { success } = req.query

  try {

    if(success === 'true') {
      return res.status(200).json({ message: "Payment successful"})
    }

    return res.status(200).json({ message: "Payment not successful"})

  } catch (error) {
    return res.status(500).json({ message: "Payment not successful"})
  }
}


exports.cancelPayment = async (req, res, next) => {

  const { canceled } = req.query
  
  try {

    if(canceled === 'true') {

      return res.status(200).json({ message: "Payment canceled"})
    }

    return res.status(200).json({ message: "not canceled"})


  } catch (error) {
    return res.status(500).json({ message: "Payment not canceled"})
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