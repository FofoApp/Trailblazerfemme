
const express = require('express')
const router = express.Router()

const { 
      stripeCheckout, 
      membershipPayment, 
      hooks, 
} = require('../controllers/stripeController/stripeController');

const { 
      membershipSubscription, 
      productPayment 
} = require('../controllers/stripeController/payment');


const { verifyAccessToken } = require('./../helpers/jwtHelper');

const { permissions } = require('./../middlewares/permissionsMiddleware');



router.post('/api/stripe/webhook',  express.raw({ type: 'application/json' }), hooks);

// 
// router.route('/').post(hooks);
// stripe listen --forward-to localhost:2000/api/stripe/webhook


// router.route('/order-checkout')
//       .post(verifyAccessToken, permissions(["user","admin"]), stripeCheckout);

// router.route('/membership-checkout')
//       .post(verifyAccessToken, permissions(["user","admin"]), membershipPayment);


router.route('/order-checkout')
      .post(verifyAccessToken, permissions(["user","admin"]), productPayment);

router.route('/membership-checkout')
      .post(verifyAccessToken, permissions(["user","admin"]), membershipSubscription);




module.exports = router