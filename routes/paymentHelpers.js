const Stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: process.env.STRIPE_API_VERSION,
});

const moment = require('moment');
const MembershipSubscriber = require('./../models/membershipModel/MembershipSubscribersModel')
const UserModel = require('./../models/UserModel');
const Order = require('../models/productModel/orderModel');


const updateUserRecordAfterSuccessfulPayment = async (userId, dataToUpload) => {

    try {

      const user =  await UserModel.findByIdAndUpdate(userId, 
        { 
          $push: { membershipSubscriberId: dataToUpload?.membershipId },
          $set: {
                  subscriptionId: dataToUpload?.membershipId,
                  paid:  dataToUpload?.isPaid,
                  isActive:  dataToUpload?.isActive,
                  isMembershipActive:  dataToUpload?.isActive,
                  membershipName:  dataToUpload?.membershipType,
                  membershipType:  dataToUpload?.membershipType,
                  amount: Number(dataToUpload?.amount),
                  sub_duration:  dataToUpload?.mode,
                  subscription_end_date:  dataToUpload?.subscription_end_date,
                  subscription_start_date:  dataToUpload?.subscription_start_date,
                  days_between_next_payment:  dataToUpload?.days_between_next_payment,
                  // paymentIntentId:  dataToUpload?.paymentIntentId,
          },
          // 
        }, {  upsert: true, new: true }).exec();
 
      if(!user) {
        console.log("User not found")
        return false;
      }

      return user;

    } catch (error) {
      console.log(error?.message)
    }
}

exports.monitorPaymentIntentSucceed = async (eventType, object) => {

    const paymentIntent = object;
    const paymentIntentId = object?.id;

    // console.log(object)


    if (object.object === 'payment_intent') {

        if (eventType === 'payment_intent.succeeded' && object?.status === 'succeeded') {

            if(object?.metadata.action === 'shop'){
                console.log({ SHOP: object.metadata })
                const {
                    product,
                    shippingAddress, 
                    taxPrice,
                    shippingPrice,
                    totalPrice,
                    itemsPrice,
                    payment_date,
                    mode,

                } = object?.metadata;

               // Update user records and membership account

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

              console.log({order})

            } else if(object?.metadata.action === 'membership') {
                
                const {
                  userId,
                  amount,
                  membershipType,
                  mode,
                  membershipId,
                  receipt_email
                } = object?.metadata;
               
                const subType = mode === 'yearly' ? 'years' : "months";
                const days = 'days';
                const start_date = moment();
                const end_date = moment().add(1, subType);

                const diff = end_date.diff(start_date, days);

                // const diff = user?.subscription_end_date.diff(user?.subscription_start_date, days);
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
                amount: amount,
                subscription_start_date: start_date,
                subscription_end_date: end_date,
                days_between_next_payment: diff,
                paymentIntentId: paymentIntentId,
            }

            
            try {
              
                  const create_new_subscriber = new MembershipSubscriber({ ...membership_data });
                  const save_new_subscriber = await create_new_subscriber.save();

                  if(!save_new_subscriber) {
                    return;
                  }

            // const user = await UserModel.findById(membership_data?.userId);

            // if(!user) {
            //   return;
            // }

            // user.fullname = user.fullname;
            // user.email = user.email;
            // user.location = user.location;
            // user.jobTitle = user.jobTitle;
            // user.phonenumber = user.phonenumber;
            // user.field = user.field;
            // user.city = user.city;
            // user.state = user.state;
            // user.blocked = user.blocked;
            // user.chargeId = user.chargeId;
            // user.chargeId = user.chargeId;
            // user.membershipId = user.membershipId;
            // user.communityId = user.communityId;
            // user.stripeCustomerId = user.stripeCustomerId;
            // user.password = user.password;
            // user.accountVerified = user.accountVerified;
            // user.about = user.about;
            // user.cityState = user.cityState;
            // user.socialLinks = user.socialLinks;
            // user.roles = user.roles;
            // user.isAdmin = user.isAdmin;
            // user.profileId = user.profileId;
            // user.profileImage = user.profileImage;
            // user.followers = user.followers;
            // user.following = user.following;
            // user.books = user.books;
            // user.booksRead = user.booksRead;
            // user.trending = user.trending;
            // user.library = user.library;
            // user.recentlySearchedBook = user.recentlySearchedBook;
            // user.profileImageCloudinaryPublicId = user.profileImageCloudinaryPublicId;
            
            
            // user.isMembershipActive = save_new_subscriber?.isActive || user.isMembershipActive;
            // user.membershipName =  save_new_subscriber?.membershipTyp || user.membershipName;
            // // user.membershipSubscriberId = user.membershipSubscriberId.push(save_new_subscriber?.membershipSubscriberId) || user.membershipSubscriberId;
            // user.subscription_end_date = save_new_subscriber?.subscription_end_date || user.subscription_end_date;
            // user.subscription_start_date = save_new_subscriber?.subscription_start_date || user.subscription_start_date;
            // user.days_between_next_payment = save_new_subscriber?.days_between_next_payment || user.days_between_next_payment;
            // user.subscriptionId = save_new_subscriber?._id || user.subscriptionId;
            // user.membershipType = save_new_subscriber?.membershipType || user.membershipType;
            // user.sub_duration = save_new_subscriber?.mode || user.sub_duration;
            // user.isActive = save_new_subscriber?.isActive || user.isActive;
            // user.paid = save_new_subscriber?.isPaid || user.paid;
            // user.amount =  Number(save_new_subscriber?.amount) || Number(user.amount);

            // await user.save();
            // paymentIntentId:  save_new_subscriber?.paymentIntentId,

            const updateUser  = await updateUserRecordAfterSuccessfulPayment(userId, save_new_subscriber._doc);

              if(updateUser) {
                // console.log({name: "updateUser collection", updateUser });
                console.log(`🔔  Webhook received! Payment for PaymentIntent ${object.id} succeeded.`);
            
            }

            } catch(error) {
                console.log(error)
            }


            }
          
  
        } else if (eventType === 'payment_intent.payment_failed') {
          
          const paymentSourceOrMethod = object.last_payment_error.payment_method
            ? paymentIntent.last_payment_error.payment_method
            : paymentIntent.last_payment_error.source;
  
          console.log(`🔔  Webhook received! Payment on ${paymentSourceOrMethod.object} ${paymentSourceOrMethod.id} of type ${paymentSourceOrMethod.type} for PaymentIntent ${object.id} failed.`);
       
        }
  
    }
}

exports.monitorPaymentSourceChargeable = async (eventType, object) => {
    
    if (object.object === 'source' && object.status === 'chargeable' && object.metadata.paymentIntent ) {

       console.log(`🔔  Webhook received! The source ${object.id} is chargeable.`);

      // Find the corresponding PaymentIntent this source is for by looking in its metadata.
      const paymentIntent = await Stripe.paymentIntents.retrieve(object.metadata.paymentIntent);
      // Check whether this PaymentIntent requires a source.

    //   console.log({ paymentIntent })

      if (paymentIntent.status != 'requires_payment_method') {
        return res.sendStatus(403);
      }

      // Confirm the PaymentIntent with the chargeable source.
      await Stripe.paymentIntents.confirm(paymentIntent.id, { source: object.id });

    }


}

exports.monitorFailedPayment = async (eventType, object) => {
    
    if ( object.object === 'source' && ['failed', 'canceled'].includes(object.status) && object.metadata.paymentIntent) {
          console.log(`🔔  The source ${object.id} failed or timed out.`);
          // Cancel the PaymentIntent.
          await Stripe.paymentIntents.cancel(object.metadata.paymentIntent);
    }

}