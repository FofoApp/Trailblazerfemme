const express = require('express');
const router = express.Router();

const { membershipPlanPayment } = require('./../controllers/paymentController');

router.post('/', membershipPlanPayment);

module.exports = router;


