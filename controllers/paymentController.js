require('dotenv').config();
const moment = require('moment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const UserModel = require('./../models/UserModel');
const PaymentModel = require('./../models/paymentModel/PaymentModel');

exports.membershipPlanPayment = async (req, res, next) => {

      // t1: 1, 2, 3
      // t2: days, months, years

      /**
       *

      {
         amount: 2000, 
         description: "There are many variations of passages of Lorem Ipsum available", 
         membershipName: "Gold",
         currency: "usd",
         stripToken: token,
         userId: "ujdjiw9w00200wiikkakan",
         planId: "koaoe09q0903j0izdjosjsd",
         t1: 1, 
         t2: "years"
      }

       *
      **/

    let { amount, description, membershipName, currency, stripToken: token, userId, planId, t1, t2 } = req.body;

    try {
          const customer =  await stripe.customers.create({ source:token.id, email: token.email });
          
          if(!customer)  return res.status(403).send({ error: "Unable to process customer payment"});
            
          const charge = await stripe.charges.create({
                amount: amount * 100,
                currency: currency,
                customer: customer.id,
                receipt_email: token.email,
                description: `${description}`,
          });

          if(!charge)  return res.status(403).send({ error: "Unable to process payment"});
      
            const todayDate = moment();
            const nextPayment = moment();
            
           //calculate next payment date
            const nextPaymentDueDate = nextPayment.add(`${t1}`, `${t2}`);

            let user = await UserModel.findById(userId);
            if(!user)  return res.status(404).send({error: "User not found"});

            const paymentData = { 
                  amount, description, membershipName, currency, stripToken: token, userId, planId, t1, t2
            }

            const payment = await PaymentModel.create(paymentData);

            if(!payment) return res.status(403).send({error: "Unable to process payment"});

            user.membershipName =  membershipName;
            user.chargeId = charge.id;
            user.membershipId = planId;
            user.paymentId = payment._id;
            user.paymentDate = todayDate;
            user.nextPaymentDueDate = nextPaymentDueDate;
            user.isPaid = true;
            user.paymentType1 =  parseInt(t1);
            user.paymentType2 =  t2;
            user.amount = charge.amount;

            user.save();

            return res.status(200).send({ customer:customer, charge: charge });

    } catch (error) {

            return res.status(500).send({ error: error.message });  
    }
}

exports.isMembershipActive = async (req, res, next) => {
      try {
            //const plan = await PlanModel.findById();
      } catch (error) {
            
      }
}