
const express = require('express')
const router = express.Router()

const {
      stripeCheckout, 
      membershipPayment,
      testUpdate
} = require('../controllers/stripeController/stripeController');

const {
      membershipSubscription,
      productPayment
} = require('../controllers/stripeController/payment');


const { verifyAccessToken } = require('./../helpers/jwtHelper');

const { permissions } = require('./../middlewares/permissionsMiddleware');

router.route('/update')
      .post(testUpdate);

// router.route('/order-checkout')
//       .post(verifyAccessToken, permissions(["user","admin"]), stripeCheckout);

// router.route('/membership-checkout')
//       .post(verifyAccessToken, permissions(["user","admin"]), membershipPayment);


router.route('/order-checkout')
      .post(verifyAccessToken, permissions(["user","admin"]), productPayment);

router.route('/membership-checkout')
      .post(verifyAccessToken, permissions(["user","admin"]), membershipSubscription);




module.exports = router