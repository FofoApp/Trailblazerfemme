
const moment = require('moment');
const MembershipSubscriber = require('./../models/membershipModel/MembershipSubscribersModel')
const User = require('./../models/UserModel');
const Stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION,
});


exports.membershipWebhookFunction = async (eventType, customer, object) => {

    const paymentIntent = object;
    const paymentIntentId = object?.id;

        console.log({ metadata: customer?.metadata })

        const { userId, membershipId, membershipType, mode, amount, userEmail, action  } = customer.metadata;
        const receipt_email = userEmail;

        const subType = mode === 'yearly' ? 'years' : "months";
        const days = 'days';
        const start_date = moment();
        const end_date = moment().add(1, subType);
        const diff = end_date.diff(start_date, days);

        // CALCULATE REMAINING DAYS FOR SUB TO EXPIRE
        // const diff = user?.subscription_end_date.diff(user?.subscription_start_date, days);


        // CREATE MEMBERSHIP DATA OBJECT

          let  membership_data = {
            mode,
            membershipType,
            membershipId,
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


        const create_new_subscriber = new MembershipSubscriber(membership_data);
        const save_new_subscriber = await create_new_subscriber.save();
      
        if(!save_new_subscriber) {
          return;
        }

        const dateNow = new Date();
      
        const user = await User.findByIdAndUpdate(userId, {
              "$push": { membershipSubscriberId: membershipId  },
              "$set": { 
                  subscriptionId: membershipId,
                  paid:  true,
                  isActive:  true,
                  isMembershipActive:  true,
                  membershipName: membershipType,
                  membershipType:  membershipType,
                  amount: Number(amount),
                  sub_duration:  mode,
                  subscription_end_date:  dateNow,
                  subscription_start_date:  dateNow,
                  days_between_next_payment:  30,
                },
        }, { multi: true, new: true });


}