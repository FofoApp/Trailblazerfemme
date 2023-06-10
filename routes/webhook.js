
const express = require('express')
const Stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const moment = require('moment');
const MembershipSubscriber = require('./../models/membershipModel/MembershipSubscribersModel')
const UserModel = require('./../models/UserModel');
const Order = require('../models/productModel/orderModel');
const router = express.Router()


router.post('/webhook',  express.raw({ type: 'application/json' }), async (req, res) => {
    // console.log({ STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY })
    let endPointSecret = process.env.STRIPE_SIGNIN_SECRET;

    const payload = req.body;
    let eventType = null;
    let data;

    // console.log({ STRIPE_SIGNIN_SECRET: process.env.STRIPE_SIGNIN_SECRET });

    if(endPointSecret) {
      const signature = req.headers['stripe-signature'];

      let event = req.body;
  
      try {
  
        event = Stripe.webhooks.constructEvent(payload, signature, endPointSecret);
    
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



  const webhookAction = data?.metadata?.action;

  console.log({ metadata: data })
    switch(webhookAction) {
      case 'shop':
        
        
          //   const {
          //     product,
          //     shippingAddress, 
          //     taxPrice,
          //     shippingPrice,
          //     totalPrice,
          //     itemsPrice,
          //     payment_date,
          // } = data.metadata;
  

        // shop action....
        // if(eventType === 'checkout.session.completed') {

        //   if(userId && paymentStatus === 'paid') {

        //     const paymentIntentId = data.payment_intent;

        //   const newOrderItems = JSON.parse(product)
        //   const newAddress = JSON.parse(shippingAddress);

        // const order_details = {
        //   user: userId,
        //   orderItems: newOrderItems,
        //   shippingAddress: newAddress,

        //   paymentMethod: "Stripe",
        //   paymentIntentId,

        //   paymentResult: {
        //     paymentIntentId: paymentIntentId,
        //     status: "paid",
        //     update_time: new Date(Date.now()),
        //   },


        //   taxPrice,
        //   shippingPrice,
        //   itemsPrice: Number(itemsPrice) || 0,
        //   totalPrice: Number(totalPrice),
        //   payment_date,
        //   isPaid: true,
        //   paidAt: new Date(Date.now()),
        //   isDelivered: false,
        // }


        // const order = await Order.create(order_details);
        
        // // console.log({order})

          
        //   }

        // } 
    
        
         if(eventType === 'payment_intent.succeeded') {
          const {
            product,
            shippingAddress, 
            taxPrice,
            shippingPrice,
            totalPrice,
            itemsPrice,
            payment_date,
        } = data.metadata;


          if(data?.status === 'succeeded') {

            const paymentIntentId = data.payment_intent;

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
        
        // console.log({order})

          
          }
        }

      break;

      case 'membership':

      console.log("MEMBERSHIP PAYMENT")

      console.log({ metadata: data })

      const { userId, amount, membershipType, mode, membershipId, receipt_email  } = data.metadata;
    
      const paymentStatus = data.payment_status;

    //   if(eventType === 'checkout.session.completed') {
      
    //       if(membershipId && paymentStatus === 'paid') {
      
    //         const paymentIntentId = data.payment_intent;
    //         //yearly or monthly
  
    //         const subType = mode === 'yearly' ? 'years' : "months";
    //         // const monthly = 'months';
  
    //        const days = 'days';
      
    //         const start_date = moment();
    //         const end_date = moment().add(1, subType);

    //         const diff = end_date.diff(start_date, days);

    //       //  const diff = user?.subscription_end_date.diff(user?.subscription_start_date, days);

    //       let  membership_data = {
    //             mode,
    //             membershipType,
    //             membershipId,
    //             // subscriptionId is the membership mongoose ID
    //             stripeSubscriptionId: paymentIntentId,
    //             userId,
    //             receipt_email,
    //             isActive: true,
    //             isPaid: true,
    //             amount: Number(amount),
    //             subscription_start_date: start_date,
    //             subscription_end_date: end_date,
    //             days_between_next_payment: diff,
    //             paymentIntentId: paymentIntentId,
    //         }

    //       const create_new_subscriber = new MembershipSubscriber(membership_data);
    //       const save_new_subscriber = await create_new_subscriber.save();

    //       const updateUser = await UserModel.findByIdAndUpdate(membership_data?.userId,
    //           {
    //             "$set": {
    //                 "subscriptionId": save_new_subscriber?.id,
    //                 "paid": save_new_subscriber?.isPaid,
    //                 "mode": save_new_subscriber?.mode,
    //                 "isActive": save_new_subscriber?.isActive,
    //                 "isMembershipActive": save_new_subscriber?.isActive,
    //                 "membershipName": save_new_subscriber?.membershipType,
    //                 "membershipType": save_new_subscriber?.membershipType,
    //                 "amount": save_new_subscriber?.amount,
    //                 "subscription_end_date": save_new_subscriber?.subscription_end_date,
    //                 "subscription_start_date": save_new_subscriber?.subscription_start_date,
    //                 "days_between_next_payment": save_new_subscriber?.days_between_next_payment,
    //                 "paymentIntentId": save_new_subscriber?.paymentIntentId,
    //             },
  
    //             "$addToSet": {  "membershipSubscriberId": save_new_subscriber?.id,  }
    //         }, { new: true  });
  
    //         // console.log({name: "updateUser collection", updateUser})


    //   }

    // } 
    
     if(eventType === "payment_intent.succeeded") {

      if(data.status === 'succeeded') {
      
        const paymentIntentId = data.payment_intent;
        //yearly or monthly

        const subType = mode === 'yearly' ? 'years' : "months";
        // const monthly = 'months';

       const days = 'days';
  
        const start_date = moment();
        const end_date = moment().add(1, subType);

        const diff = end_date.diff(start_date, days);

      //  const diff = user?.subscription_end_date.diff(user?.subscription_start_date, days);

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
    }

    break;

    default:
    console.log(`Unhandled event type ${ eventType }`);





    }
  
    // if(eventType === "payment_intent.succeeded") {
    //   console.log({ eventType })
    //   console.log({ data })

    // } else {
    //   console.log("An error occured")
    // }
  
    res.status(200).end()
  
  });


module.exports = router;