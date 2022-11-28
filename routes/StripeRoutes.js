
const express = require('express')
const router = express.Router()

const { stripeCheckout, webhooks } = require('../controllers/stripeController/stripeController')

router.route('/webhook')
      .post(webhooks);


router.route('/create-checkout-session')
      .post(stripeCheckout);
      


module.exports = router