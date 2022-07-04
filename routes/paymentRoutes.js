const express = require('express');
const router = express.Router();

const { membershipPlanPayment } = require('./../controllers/paymentController');

router.post('/pay', membershipPlanPayment);

module.exports = router;


