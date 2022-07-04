const moment = require('moment');

exports.recurrentPaymentMiddleware = async (req, res, next) => {

    try {
        // const { timespan } = req.body;
        const timespan = 'years';
    // const todayDate = moment().format("YYYY-MM-DD hh:mm:ss");

        const todayDate = moment();
        const nextPayment = moment();

        const nextPaymentDueDate = nextPayment.add(1, `${timespan}`);


        return res.status(200).send({ todayDate, nextPaymentDueDate });
        
    } catch (error) {

        return res.status(500).send({ error: error.message });
    }
}