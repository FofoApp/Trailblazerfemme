
const moment = require('moment');
const MembershipSubscriber = require('./../models/membershipModel/MembershipSubscribersModel')
const UserModel = require('./../models/UserModel');

exports.membershipWebhookFunction = async (eventType, object) => {

  // console.log({object})

    const paymentIntent = object;
    const paymentIntentId = object?.id;

        switch (eventType) {
            // case 'payment_intent.succeeded':
            case 'checkout.session.completed':

            //   const paymentIntent = event.data.object;              
              console.log('PaymentIntent was successful!');
              
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

              // CALCULATE REMAINING DAYS FOR SUB TO EXPIRE
              // const diff = user?.subscription_end_date.diff(user?.subscription_start_date, days);


              // CREATE MEMBERSHIP DATA OBJECT

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

                const dataToUpload = save_new_subscriber?._doc;

                // Update user data for membership subscription
                const dateNow = new Date();
                console.log({ 
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

                  });

                const user =  await UserModel.findByIdAndUpdate(userId,
                  { 
                    // $push: { membershipSubscriberId: membershipId },
                    $set: {
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
                            // paymentIntentId:  dataToUpload?.paymentIntentId,
                    },
                    // 
                  }, { new: true }).exec();
           
                if(!user) {
                  console.log("User not found")
                  return false;
                }

              // console.log({ user });


             } catch (error) {
              console.log(error)
             }

              break;
            case 'payment_method.attached':
            //   const paymentMethod = event.data.object;
              console.log('PaymentMethod was attached to a Customer!');
              break;
            // ... handle other event types
            default:
              console.log(`Unhandled event type ${eventType}`);
    }

// mongodump --db=test --archive=./test.json --json
// mongorestore --db=test --archive=./test.json --json

// mongoexport --collection=<coll> <options> <connection-string></connection-string>

// mongodump -d mongodb+srv://trailblazerfemme:EcfBaD7sXgXCp3G9@cluster0.fmiw4.mongodb.net/?retryWrites=true&w=majority -o C:\Users\Mandate\Desktop
// mongodb+srv://trailblazerfemme:EcfBaD7sXgXCp3G9@cluster0.fmiw4.mongodb.net/?retryWrites=true&w=majority/test










}