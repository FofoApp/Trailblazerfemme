
const express = require('express')
const router = express.Router()

const { stripeCheckout, hooks, membershipPayment, paymentSuccess, cancelPayment } = require('../controllers/stripeController/stripeController')


const { verifyAccessToken } = require('./../helpers/jwtHelper');

const { permissions } = require('./../middlewares/permissionsMiddleware');



router.route('/webhook')
            .post(express.raw({type:"application/json"}), hooks);


router.route('/order-checkout')
      .post(verifyAccessToken, permissions(["user","admin"]), stripeCheckout);

router.route('/membership-checkout')
      .post(verifyAccessToken, permissions(["user","admin"]), membershipPayment);

router.route('/payment_success')
      .get(paymentSuccess);

router.route('/payment_canceled')
      .get(cancelPayment);


module.exports = router