const Joi = require('@hapi/joi');
const JVPatch = require('joi-validate-patch');

// const registerSchema = (userInput, field = null) => {

//     let schema = Joi.object().keys({
//         fullname: Joi.string().min(3).max(100).required(),
//         email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).lowercase().required(),
//         phonenumber: Joi.string().required(),
//         field: Joi.string().required(),
//         roles: Joi.string().valid("user", "admin", "superAdmin"),
//         password: Joi.string().min(3).required().strict(),
//         profileImage: Joi.string()
//         // confirmPassword: Joi.string().valid(Joi.ref('password')).required().strict()
//     });
//     console.log(schema)

//     if(!field) {
//        return schema.validateAsync(userInput);
//         if(error) {
//             return error.details[0].message;
//         };
//         return value;

//     } else {
//         const dynamicSchema = Object.keys(schema)
//         .filter((key) => field.includes(key))
//         .reduce((obj, key) => {
//             obj[key] = schema[key];
//             return obj;
//         }, {});

//         return dynamicSchema.validateAsync(userInput);

//         if(error) {
//             return error.details[0].message;
//         }
//         return value;
//     }
    
    
// }


const registerSchema = (userInput, field = null) => {

    let schema = Joi.object({
        fullname: Joi.string().min(3).max(100).required(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).lowercase().required(),
        phonenumber: Joi.string().required(),
        field: Joi.string().required(),
        roles: Joi.string().valid("user", "admin", "superAdmin"),
        password: Joi.string().min(3).required().strict(),
        profileImage: Joi.string(),
        
        // confirmPassword: Joi.string().valid(Joi.ref('password')).required().strict()
    })
//  console.log(schema._ids._byKey)
//  console.log(schema._ids._byKey)

    if(!field) {
        return schema.validateAsync(userInput);
        
    }
    
    // const dynamicSchema = Object.keys(schema)
    // .filter(key => field.includes(key))
    // .reduce((obj, key) => {
    //     obj[key] = schema[key];
    //     return obj;
    // }, {});

     return JVPatch.validate(userInput, schema);


// return Joi.validate(user, dynamicSchema);
// }

    // if(!field) {
    //    return schema.validateAsync(userInput);
    //     if(error) {
    //         return error.details[0].message;
    //     };
    //     return value;

    // } else {
    //     const dynamicSchema = Object.keys(schema)
    //     .filter((key) => field.includes(key))
    //     .reduce((obj, key) => {
    //         obj[key] = schema[key];
    //         return obj;
    //     }, {});

    //     return dynamicSchema.validateAsync(userInput);

    //     if(error) {
    //         return error.details[0].message;
    //     }
    //     return value;
    // }
    
    
}


const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(3).required()
}).options({ abortEarly: true});


const resetPasswordSchema = Joi.object({
    email: Joi.string().email().lowercase().required()
});

// function passwordOnlySchema(userInput) {
//     const schema = Joi.object().keys({
//         password: Joi.string().trim().min(6).required(),
//         confirmPassword: Joi.string().valid(Joi.ref('password')).required().strict()
//     }).options({ abortEarly: true});

//     return schema.validateAsync(userInput);

// }

function passwordOnlySchema(userInput, field = null) {
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

const otpValidation = (otp) => {
    const schema = Joi.object().keys({
        otp: Joi.number().trim().min(4).max(4).required()
      
    }).options({ abortEarly: true});

    return schema.validateAsync(otp);
}

module.exports = {
    registerSchema,
    loginSchema,
    resetPasswordSchema,
    passwordOnlySchema,
    otpValidation
}