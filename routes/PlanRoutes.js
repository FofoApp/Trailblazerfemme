const express = require('express');
const PlanController = require('./../controllers/PlanController');
const router = express.Router();

router.post('/create', PlanController.createPlan);
router.get('/list', PlanController.listPlans);

module.exports = router;