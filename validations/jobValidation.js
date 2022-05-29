
const Joi = require('joi')

const jobApplicationValidation = (userInputs, field = false) => {

    const fieldToPatch = Object.keys(userInputs);

    let schema = {
        fullname: Joi.string().min(2).required(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).lowercase().required(),
        phonenumber: Joi.string().required(),
        availability: Joi.string().required(),

        resumeePublicId: Joi.string(),
        resummeImage: Joi.string(),

        coverLetterPublicId: Joi.string(),
        coverLetterImage: Joi.string(),

    };

    let joiSchema = Joi.object(schema);

    if (!field) {

        return joiSchema.validateAsync(userInputs);

    } else {
        const dynamicSchema = Object.keys(schema)
            .filter(key => fieldToPatch.includes(key))
            .reduce((obj, key) => {
                obj[key] = schema[key];
                return obj;
            }, {});

        joiSchema = Joi.object(dynamicSchema);

        return joiSchema.validateAsync(userInputs);
    }
}

const uploadDocumentValidation = (userInputs, field = false) => {

    const fieldToPatch = Object.keys(userInputs);
    let schema = {
        resumeePublicId: Joi.string().required(),
        resummeImage: Joi.string().required(),

        coverLetterPublicId: Joi.string().required(),
        coverLetterImage: Joi.string().required(),

    };

    let joiSchema = Joi.object(schema);

    if (!field) {

        return joiSchema.validateAsync(userInputs);

    } else {
        const dynamicSchema = Object.keys(schema)
            .filter(key => fieldToPatch.includes(key))
            .reduce((obj, key) => {
                obj[key] = schema[key];
                return obj;
            }, {});

        joiSchema = Joi.object(dynamicSchema);

        return joiSchema.validateAsync(userInputs);
    }
}

module.exports = {
    jobApplicationValidation,
    uploadDocumentValidation
}