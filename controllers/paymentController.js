require('dotenv').config();
const moment = require('moment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const UserModel = require('./../models/UserModel');

exports.membershipPlanPayment = async (req, res, next) => {

      // t1: 1, 2, 3
      // t2: days, months, years

    const { product, stripToken: token, userId, t1, t2 } = req.body;
    
    try {
          const customer =  await stripe.customers.create({ source:token.id, email: token.email });
            
          const charge = await stripe.charges.create({
                amount: product.price * 100,
                currency: "usd",
                customer: customer.id,
                receipt_email: token.email,
                description: `Purchased the ${product.description}`,
          });

          if(!charge)  return res.status(403).send({ error: "Unable to process payment"});
      
            const todayDate = moment();
            const nextPayment = moment();
            
           //calculate next payment date
            const nextPaymentDueDate = nextPayment.add(`${t1}`, `${t2}`);

            let user = await UserModel.findById(userId);

            user.membershipName =  "Gold";
            user.membershipId = "kdkdkdnkdnklnlksnkn";
            user.paymentId = "PaymentModel._id";
            user.paymentDate = todayDate;
            user.nextPayment = nextPaymentDueDate;
            user.isPaymentActive =  true;
            user.paymentType =  t2;
            user.amount = "2000";

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