const Joi = require('joi');

const planValidation = (userInput) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        price: Joi.number().required(),

    }).options({ abortEarly: true});

    return schema.validateAsync(userInput);
}



module.exports = { planValidation }