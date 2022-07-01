const express = require('express');
const PlanController = require('./../controllers/PlanController');
const { verifyAccessToken } = require('./../helpers/jwtHelper');
const router = express.Router();

router.post('/create', PlanController.createPlan);
router.get('/list', verifyAccessToken, PlanController.listPlans);
router.get('/show/:membershipId', verifyAccessToken, PlanController.findPlanById);

module.exports = router;