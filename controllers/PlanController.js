const mongoose = require('mongoose');
const MembershipModel = require('./../models/adminModel/AdminMembershipModel');

exports.createPlan = async (req, res, next) => {
    const { name, price } = req.body;

    try {
        const plan = await planValidation({name, price});

        const createPlan = new MembershipModel(plan);
        
        const savePlan = await createPlan.save();

        if(!savePlan) {
            return res.status(401).send({ message: "Unable to create plan"});   
        }

        return res.status(201).send({ message: "Plan created successfully" });

    } catch (error) {
        return res.status(500).send(error);
        // return next(error)
    }

}

exports.findPlanById = async (req, res, next) => {
    const { membershipId } = req.params;
    try {
        if(!mongoose.Types.ObjectId.isValid(membershipId)) {
            return res.status(200).send({error: "Invalid plan parameter"});
        }
        const plan = await MembershipModel.findById(membershipId);
        
        if(!plan) {
            return res.status(404).send({ error: "Membership plan not found" });
        }
        return res.status(200).send(plan);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

exports.listPlans = async (req, res, next) => {
    try {
        const plans = await PlanModel.find({});
        
        if(!plans) {
            return res.status(401).send({ message: "Unable to list plans" });
        }

    } catch (error) {
        return res.status(500).send(error);
    }
}

