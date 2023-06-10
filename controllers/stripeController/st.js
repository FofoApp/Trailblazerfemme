exports.hooks = async (req, res) => {

    // var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;  
    
    const payload = req.body;
    let eventType = null;
    let data;
  
    if(endPointSecret) {
  
      let event = null;
      const sig = req.headers['stripe-signature'];
  
      try {
  
        event = stripe.webhooks.constructEvent(payload, sig, endPointSecret);
  
        data = event.data.object;
        eventType = event.type;
            
      } catch (error) {
          // return 
          console.log(` Webhook signature verification failed.`, error);
          res.status(400).send(`Webhook Error: ${error.message}`);
          return;
      }
  
    } else {
      data = req.body.data.object;
      eventType = req.body.type;
    }
  
  
    console.log({ metadata: data.metadata})
    console.log({event: "Event", eventType })
  
  
    if(eventType === "checkout.session.completed") {
      stripe.customers.retrieve(data.customer)
      then((customer) => {
        console.log("Customer details:", customer)
      }).catch((error) => {
        console.log(error)
      })
  
      return
    }
  
  
    switch(eventType) {
     
      case 'checkout.session.completed':
  
      //   if(eventType === 'checkout.session.completed') {
  
      //     const {
      //       product,
      //       shippingAddress, 
      //       taxPrice,
      //       shippingPrice,
      //       userId,
      //       totalPrice,
      //       itemsPrice,
      //       payment_date,
  
      //   } = data.metadata
  
      //   const paymentStatus = data.payment_status;
    
      //   if(data.metadata && paymentStatus === 'paid') {
    
      //     const paymentIntentId = data.payment_intent;
      
      //     const orderId = data.metadata?.orderId
      //     const newOrderItems = JSON.parse(product)
      //     const newAddress = JSON.parse(shippingAddress);
  
      //     const order_details = {
      //       user: userId,
      //       orderItems: newOrderItems,
      //       shippingAddress: newAddress,
  
      //       paymentMethod: "Stripe",
      //       paymentIntentId,
  
      //       paymentResult: {
      //         paymentIntentId: paymentIntentId,
      //         status: "paid",
      //         update_time: new Date(Date.now()),
      //       },
  
  
      //       taxPrice,
      //       shippingPrice,
      //       itemsPrice: Number(itemsPrice) || 0,
      //       totalPrice: Number(totalPrice),
      //       payment_date,
      //       isPaid: true,
      //       paidAt: new Date(Date.now()),
      //       isDelivered: false,
      //       orderId,
      //     }
    
      //     const order = await Order.create(order_details);
          
      //     console.log({order})
  
      //   }
  
        
      //   // res.status(201).send({ stage: 4, message: "Payment successfull" })
      //   return res.end()
    
      // }
  
      
      console.log(`SHOP ACTION`)
      console.log(`EVENT COMPLETED`)
  
      stripe.customers.retrieve(data.customer)
            then((customer) => {
              console.log("Customer details:", customer)
            }).catch((error) => {
              console.log(error)
            })
    
      break;
  
      case 'membership':
        console.log(`MEMBERSHIP ACTION`)
        console.log(`EVENT COMPLETED`)
        // if(eventType === 'checkout.session.completed') {
  
  
        //   const { userId, amount, membershipType, mode, membershipId, receipt_email  } = data.metadata;
        //   console.log({ metadata: data.metadata})
        //   console.log({ name: "Event object", event: data.metadata })
        //   // 
        //   const paymentStatus = data.payment_status;
      
        //   if(membershipId && paymentStatus === 'paid') {
      
        //     const paymentIntentId = data.payment_intent;
        //     //yearly or monthly
  
        //     const annually = mode === 'yearly' ? 'years' : "months";
        //     // const monthly = 'months';
  
        //    const days = 'days';
      
        //     const start_date = moment();
        //     const end_date = moment().add(1, annually);
        //     const diff = end_date.diff(start_date, days);
      
        //    let  membership_data =   {
        //             mode,
        //             membershipType,
        //             membershipId,
        //             // subscriptionId is the membership mongoose ID
        //             subscriptionId: paymentIntentId,
        //             userId,
        //             receipt_email,
        //             isActive: true,
        //             isPaid: true,
        //             amount: Number(amount),
        //             subscription_start_date: start_date,
        //             subscription_end_date: end_date,
        //             days_between_next_payment: diff,
        //             paymentIntentId: paymentIntentId,
        //     }
      
  
        //     const create_new_subscriber = new MembershipSubscriber(membership_data);
        //     const save_new_subscriber = await create_new_subscriber.save();
  
        //     console.log({ name: "create_new_subscriber", create_new_subscriber})
  
        //     const updateUser = await User.findByIdAndUpdate(userId,
        //       {
        //         "$set": {
        //             "subscriptionId": save_new_subscriber?.id,
        //             "paid": save_new_subscriber?.isPaid,
        //             "mode": save_new_subscriber?.mode,
        //             "isActive": save_new_subscriber?.isActive,
        //             "isMembershipActive": save_new_subscriber?.isActive,
        //             "membershipName": save_new_subscriber?.membershipType,
        //             "membershipType": save_new_subscriber?.membershipType,
        //             "amount": save_new_subscriber?.amount,
        //             "subscription_end_date": save_new_subscriber?.subscription_end_date,
        //             "subscription_start_date": save_new_subscriber?.subscription_end_date,
        //             "days_between_next_payment": save_new_subscriber?.subscription_end_date,
        //             "paymentIntentId": save_new_subscriber?.paymentIntentId,
        //         },
  
        //         "$addToSet": {  "membershipSubscriberId": save_new_subscriber?.id,  }
        //     },
        //     { new: true  });
  
        //     console.log({name: "updateUser collection", updateUser})
  
          
        //   }
      
        // }
  
        stripe.customers.retrieve(data.customer)
        then((customer) => {
          console.log("Customer details:", customer)
        }).catch((error) => {
          console.log(error)
        })
  
      break;
  
      default:
        console.log(`Unhandled event type ${ eventType }`);
    }
  
  
    res.send()
  
  }
  