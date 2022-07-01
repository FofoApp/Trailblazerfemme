
const PlanModel = require('./../models/PlanModel');

const createPlan = async (req, res, next) => {
    const { name, price } = req.body;

    try {
        const plan = await planValidation({name, price});

        const createPlan = new PlanModel(plan);
        
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

const listPlans = async (req, res, next) => {
    try {
        const plans = await PlanModel.find({});
        
        if(!plans) {
            return res.status(401).send({ message: "Unable to list plans" });
        }

    } catch (error) {
        return res.status(500).send(error);
    }
}

module.exports  = {
    createPlan,
    listPlans
}