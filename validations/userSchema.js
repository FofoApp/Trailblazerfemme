const Joi = require('joi');

const registerSchema = Joi.object({
    fullname: Joi.string().min(3).max(100).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).lowercase().required(),
    phonenumber: Joi.string().required(),
    field: Joi.string().required(),
    roles: Joi.string().valid("user", "admin", "superAdmin"),
    password: Joi.string().min(3).required()
});

module.exports = { registerSchema }