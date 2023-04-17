require('dotenv').config()
const mongoose = require('mongoose')
const moment = require('moment');
const Membership = require('../../models/adminModel/AdminMembershipModel');
const MembershipSubscriber = require('../../models/membershipModel/MembershipSubscribersModel');

const Order = require('../../models/productModel/orderModel');
const User = require('../../models/UserModel');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)



exports.pay = async (req, res, next) => {

    const { totalAmount, description, receipt_email, membershipType, membershipId, mode } = req.body

    try {

        if(!totalAmount) {
            return res.status(400).json({ error: "Provide service price" })
        }

        // const customer = await stripe.customers.create({
        //     email: "olawumi.olusegun@gmail.com",
        //     name: "olawumi Olusegun"
        // });

        const customer = await stripe.customers.create();

        if(customer) {

            const ephemeralKey = await stripe.ephemeralKeys.create(
              {customer: customer?.id},
              {apiVersion: '2022-11-15'}
            );

    
            // let paymentMethod = await stripe.paymentMethods.create({
            //     type: 'card',
            //     card: {
            //     number: '4242424242424242',
            //     exp_month: 07,
            //     exp_year: 2023,
            //     cvc: '123',
            //     },
            //     });
    
                let paymentIntent = await stripe.paymentIntents.create({
                // payment_method: paymentMethod.id,
                customer: customer?.id,
                amount: Number(totalAmount) * 100, // USD*100
                currency: 'usd',
                // description,
                receipt_email,
                // shipping: {
                //   address: {
                //     city: "",
                //     country: "",
                //     line1: "",
                //     line2: "",
                //     postal_code: "",
                //     state: "",
                //   },
                //   name: req.body.name,
                //   phone: req.body.phone,
                // },

                automatic_payment_methods: {
                    enabled: true,
                },
                // payment_method_types: ['card'],
                // confirm: true,
                metadata: { 
                    integration_check: 'accept_a_payment',
                    name: "Olawumi Olusegun",
                    userId: "kjsndkjsnkjdnskjd",
                    payment_date: Date.now(),
                    action: "membership",
                    price: totalAmount,

                    membershipType,
                    mode,
                    membershipId
                },
                });

                
            return res.status(200).json({ 
                paymentIntent: paymentIntent?.client_secret,
                customer: customer?.id,
                ephemeralKey: ephemeralKey?.secret,
            })

        }



    } catch(error) {
        return res.status(500).json({ error: error?.message })
    }
} 


exports.stripePayment = async (req, res) => {

    const { totalAmount, email } = req.body; 
    const loggedInUser = req?.user?.id;

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Number(totalAmount) * 100,
        currency: "usd",
        payment_method_types: ["card"],
        receipt_email: email,
        // customer: "user?.id",
        metadata: {integration_check: 'accept_a_payment'},
      });
    } catch (err) {
        console.log({ err1: err })
      return res.status(500).send({ error: "Unable to proces payment" });
    }
  
    console.log(paymentIntent);

    try {
    //   const paymentConfirm = await stripe.paymentIntents.confirm(
    //     paymentIntent?.id,
    //     { payment_method: "card" }
    //   );

    //   console.log(paymentIntent);
      return res.status(200).send(paymentIntent);
      
    } catch (err) {
        console.log({ err2: err })
      return res.status(500).send(err);
    }

}

exports.membershipSubscription = async (req, res, next) => {

    const { membership } = req.body;


    const userId = req?.user?.id;

    try {

        if(!membership?.amount) {
            return res.status(400).json({ error: "Provide service price" })
        }

        const customer = await stripe.customers.create();

        if(customer) {

            const ephemeralKey = await stripe.ephemeralKeys.create(
              {customer: customer?.id},
              {apiVersion: '2022-11-15'}
            );

            const membership_data =  { 
                ...membership,
                userId,
                action: "membership",
                integration_check: 'accept_a_payment',
                payment_date: new Date(Date.now()),
            }
    
            let paymentIntent = await stripe.paymentIntents.create({
            customer: customer?.id,
            amount: Number(membership?.amount) * 100, // USD*100
            currency: 'usd',
            receipt_email: membership?.receipt_email,
            
            automatic_payment_methods: { enabled: true, },

            metadata: { ...membership_data },

            });

                
            return res.status(200).json({ 
                paymentIntent: paymentIntent?.client_secret,
                customerId: customer?.id,
                ephemeralKey: ephemeralKey?.secret,
            })

        }



    } catch(error) {
        console.log({ error })
        return res.status(500).json({ error: error?.message })
    }
}


exports.productPayment = async (req, res, next) => {
    try {
         
    } catch (error) {
        
    }
}