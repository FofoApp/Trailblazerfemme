const Joi = require('@hapi/joi');

exports.registerValidation = (userInputs, field = false) => {

    const fieldToPatch = Object.keys(userInputs);
   
    let schema = {
        fullname: Joi.string().min(3).max(100).required(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).lowercase().required(),
        phonenumber: Joi.string().required(),
        field: Joi.string().required(),
        location: Joi.string(),
        jobTitle: Joi.string(),
        cityState: Joi.string(),
        membership: Joi.string(),
        roles: Joi.string().valid("user", "admin", "superAdmin"),
        password: Joi.string().min(3).required().strict(),
        profileImage: Joi.string(),

    };

    let joiSchema = Joi.object(schema)


    if (!field) return joiSchema.validateAsync(userInputs);
    
    const dynamicSchema = Object.keys(schema)
    .filter(key => fieldToPatch.includes(key))
    .reduce((obj, key) => {
        obj[key] = schema[key];
        return obj;
    }, {});

    joiSchema = Joi.object(dynamicSchema);

    return joiSchema.validateAsync(userInputs);

}



exports.loginValidation = (userInputs, field = false) =>  {
   
    const fieldToPatch = Object.keys(userInputs);
    let schema = {
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().min(3).required()
    };

    // let opts =  options({ 
    //     abortEarly: true,
    //     errors: {
    //         wrap: {
    //             label: ''
    //         }
    //     }
    // });

    let joiSchema = Joi.object(schema);


    if (!field) return joiSchema.validateAsync(userInputs)
    
    const dynamicSchema = Object.keys(schema)
    .filter(key => fieldToPatch.includes(key))
    .reduce((obj, key) => {
        obj[key] = schema[key];
        return obj;
    }, {});

    joiSchema = Joi.object(dynamicSchema);

    return joiSchema.validateAsync(userInputs);

}

exports.resetPasswordSchema = Joi.object({
    email: Joi.string().email().lowercase().required()
});


exports.passwordOnlySchema = (userInput, field = null) => {
    const schema = Joi.object().keys({
        password: Joi.string().trim().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required().strict()
    }).options({ abortEarly: true});

    if(!field) {
        return schema.validateAsync(userInput);
    }

    const dynamicSchema = Object.keys(schema).filter((key) => field.includes(key)).reduce((obj, key) => {
        obj[key] = schema[key];
        return obj;
    }, {});

    return dynamicSchema.validateAsync(userInput, dynamicSchema);

}

exports.otpValidation = (otp) => {

    const schema = Joi.object().keys({
        otp: Joi.number().required()
      
    }).options({ abortEarly: true});

    return schema.validateAsync({otp: otp});
}

