require('dotenv').config()
const mongoose = require('mongoose')
const moment = require('moment');
const Membership = require('../../models/adminModel/AdminMembershipModel');
const MembershipSubscriber = require('../../models/membershipModel/MembershipSubscribersModel');

const Order = require('../../models/productModel/orderModel');
const User = require('../../models/UserModel');

const Stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY)



exports.pay = async (req, res, next) => {

    const { totalAmount, description, receipt_email, membershipType, membershipId, mode } = req.body

    try {

        if(!totalAmount) {
            return res.status(400).json({ error: "Provide service price" })
        }

        // const customer = Stripe.customers.create({
        //     email: "olawumi.olusegun@gmail.com",
        //     name: "olawumi Olusegun"
        // });

        const customer = Stripe.customers.create();

        if(customer) {

            const ephemeralKey = Stripe.ephemeralKeys.create(
              {customer: customer?.id},
              {apiVersion: '2022-11-15'}
            );

    
            // let paymentMethod = Stripe.paymentMethods.create({
            //     type: 'card',
            //     card: {
            //     number: '4242424242424242',
            //     exp_month: 07,
            //     exp_year: 2023,
            //     cvc: '123',
            //     },
            //     });
    
                let paymentIntent = Stripe.paymentIntents.create({
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
      paymentIntent = Stripe.paymentIntents.create({
        amount: Number(totalAmount) * 100,
        currency: "usd",
        payment_method_types: ["card"],
        receipt_email: email,
        // customer: "user?.id",
        metadata: {integration_check: 'accept_a_payment'},
      });
    } catch (err) {
        console.log({ err1: err })
      return res.status(200).send({ error: "Unable to proces payment" });
    }
  
 

    try {
      return res.status(200).send(paymentIntent);
      
    } catch (err) {
      return res.status(200).send(err);
    }

}



exports.membershipSubscription = async (req, res, next) => {

    const { membership } = req.body;

    const userId = req?.user?.id;
    const email = req?.user?.email;
    const fullname = req?.user?.fullname;

    console.log(membership)

    try {

        if(!membership?.amount) {
            return res.status(400).json({ error: "Membership price required" });
        }

        if(!mongoose.Types.ObjectId.isValid(membership?.membershipId) || !membership?.membershipId ) {
            return res.status(400).json({ status: "failed", error: "Invalid membership ID"});
        }

        let isExist = await Membership.findById(membership?.membershipId);

        console.log({ isExist })

        if(!isExist) {
            return res.status(400).json({ status: "failed", error: "Invalid membership ID"});
        }

        // action: "membership"
        // if(membership?.action !== "membership") {
        //     return res.status(400).json({ status: "failed", error: "Invalid action type" });
        // }

        // const user = await UserModel.findOne({ email });

        let user = await User.findById(userId);

        console.log(user)
        
        if(!user) return res.status(404).send({ error: "Invalid user"});

        // let membership = await Membership.findById(membership.membershipId);
        
        // if(!membership) {
        //   return res.status(404).json({ status: "failed",  error: "Invalid membership"});
        // }

        // const subscriber = await MembershipSubscriber.findOne({ userId: userId, isActive: true });

        // const isBefore = moment().isBefore(user?.subscription_end_date);

        // console.log({ isBefore})
           
        // if(user?.id.toString() === userId.toString() && user?.membershipName?.toLowerCase() !== 'free' && isBefore && user?.isActive === true ) {
        //   console.log("You still have an active plan")
        //     return res.status(400).json({ status: "failed", error: "You still have an active plan"});
        // }



        const memData = {
            price_data: {
              currency: 'usd',
              unit_amount: Number(membership?.amount) * 100,
              product_data: {
                name: membership?.membershipType,
                // description: item?.desc,
                // images: [item.image],
              },
              
            },
            quantity: 1,
      
          }


        const membershipMetadata = {
            "amount": Number(membership?.amount),
            "membershipType": membership?.membershipType,
            "membershipId": membership?.membershipId,
            "mode": membership?.mode,
            
            "userId": userId,
            "receipt_email": email,
            "action": "membership",
            "integration_check": 'accept_a_payment',
            "payment_date": new Date(Date.now()),    
        };

        const customer = await Stripe.customers.create({
            name: fullname,
            email: email,
            metadata: membershipMetadata
        });

        const ephemeralKey = await Stripe.ephemeralKeys.create(
            {customer: customer.id},
            {apiVersion: '2020-08-27'}
          );
          const paymentIntent = await Stripe.paymentIntents.create({
            amount: Number(membership?.amount),
            currency: 'usd',
            customer: customer.id,
            automatic_payment_methods: {
              enabled: true,
            },
            metadata: membershipMetadata
          });

        const session = await Stripe.checkout.sessions.create({
            payment_method_types: ['card'],
              customer: customer?.id,
              line_items: [memData],
              mode: 'payment',
            //   customer_email: email,     
            success_url: `${process.env.CLIENT_URL}/?success=true`,
            cancel_url: `${process.env.CLIENT_URL}/?canceled=true`,
            
        });

        // success_url: `https://6469ec122631c1598c5d449c--leafy-paprenjak-6ddfe1.netlify.app/?success=true`,
        // cancel_url: `https://6469ec122631c1598c5d449c--leafy-paprenjak-6ddfe1.netlify.app/?canceled=true`,


        return res.status(200).json({
        paymentIntent: paymentIntent?.client_secret,
        customerId: customer?.id,
        ephemeralKey: ephemeralKey?.secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        session
        });

    } catch(error) {
        console.log(error)
        return res.status(500).json({ error: error?.message })
    }
}


exports.productPayment = async (req, res, next) => {

    // const { product } = req.body;
    // console.log(req.body)

    const { productId, orderItems, shippingAddress, taxPrice, shippingPrice, itemsPrice } = req.body.product;

    const { id: userId, fullname, email } = req.user;


    try {

        if(orderItems?.length === 0) {
            return res.status(400).json({ status: "failed", error: "Order item(s) cannot be empty" })
        }


        let totalPrice = orderItems.reduce((acc, curr) => {
            return acc + (curr.price * curr.qty);
        }, 0);

        const line_items = orderItems?.map((order) => {
            return  { 
                price_data: { 
                  currency: "usd", 
                  product_data: { 
                    name: order?.name, 
                  }, 
                  unit_amount: Number(order?.price) * 100, 
                }, 
                quantity: order?.qty, 
              }
    
        })


        const shopMetadata = {
            "product": JSON.stringify(orderItems),
            "shippingAddress": JSON.stringify(shippingAddress),
            "taxPrice": taxPrice,
            "shippingPrice": shippingPrice,
            "itemsPrice": Number(itemsPrice),
            "totalPrice": Number(totalPrice),
            userId,
            action: "shop",
            integration_check: 'accept_a_payment',
            payment_date: new Date(),
        };

        const customer = await Stripe.customers.create({
            name: fullname,
            email: email,
            metadata: shopMetadata, 
        });


        const ephemeralKey = await Stripe.ephemeralKeys.create(
            { customer: customer?.id },
            {apiVersion: '2020-08-27'}
        );

        const paymentIntent = await Stripe.paymentIntents.create({
            amount: Number(totalPrice),
            currency: 'usd',
            customer: customer?.id,
            automatic_payment_methods: {
              enabled: true,
            },
            metadata: shopMetadata, 
          });

        const session = await Stripe.checkout.sessions.create({ 
            payment_method_types: ["card"], 
            line_items, 
            mode: "payment",
            metadata: shopMetadata, 
            success_url: `${process.env.CLIENT_URL}/?success=true`,
            cancel_url: `${process.env.CLIENT_URL}/?canceled=true`,
        }); 

        // console.log({ customer, ephemeralKey, paymentIntent  });

        return res.status(200).json({
          paymentIntent: paymentIntent?.client_secret,
          customerId: customer?.id,
          ephemeralKey: ephemeralKey?.secret,
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
          session: session.url
        });
       

        // if(customer) {

        //     const ephemeralKey = await Stripe.ephemeralKeys.create(
        //       { customer: customer?.id },
        //       { apiVersion: '2022-11-15' }
        //     );

            
        //     let paymentIntent = await Stripe.paymentIntents.create({
        //     customer: customer?.id,
        //     amount: Number(totalPrice) * 100,
        //     currency: 'usd',
        //     receipt_email: receipt_email,
            
        //     automatic_payment_methods: { enabled: true, },
        //     metadata: {
        //         "product": JSON.stringify(product?.orderItems),
        //         "shippingAddress": JSON.stringify(product?.shippingAddress),
        //         "taxPrice": product?.taxPrice,
        //         "shippingPrice": product?.shippingPrice,
        //         "itemsPrice": product?.itemsPrice,
        //         "totalPrice": Number(totalPrice),
        //         userId,
        //         action: "shop",
        //         integration_check: 'accept_a_payment',
        //         payment_date: new Date(),
        //     },

        //     });

        //     console.log({ data: new Date() })
                
        //     return res.status(200).json({ 
        //         paymentIntent: paymentIntent?.client_secret,
        //         customerId: customer?.id,
        //         ephemeralKey: ephemeralKey?.secret,
        //         mode: "shop",
        //     })

        // }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Error processing product payment"})
    }
}