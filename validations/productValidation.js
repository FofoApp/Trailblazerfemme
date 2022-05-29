const Joi = require('joi');

const productValidation = (userInputs, field = false) => {

    const fieldToPatch = Object.keys(userInputs);
  /*
        {
            name: "Tote Bag",
            description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which able",
            price: [{  s: 2000,  m: 3000, l: 4000, xl: 5000, xxl: 6000, xxxl: 7000, }],
            colour: ['Yellow', "Blue"],
            images: [{  image1: "default.jpg",  image2: "default.jpg",  image3: "default.jpg" }],
            quantity: 5,
            // ratings: [{ type: Number, default: 0 }],
        }
    */
    let schema = {
            name: Joi.string().min(2).required(),
            description: Joi.string().min(2).required(),
            price: Joi.array().items({
                s: Joi.number(),
                m: Joi.number(),
                l: Joi.number(),
                xl: Joi.number(),
                xxl: Joi.number(),
                xxxl: Joi.number(),
            }).required(),
            images: Joi.array().items({
                image1: Joi.string(),
                image2: Joi.string(),
                image3: Joi.string()
            }).required(),
            colour: Joi.array().items(Joi.string()).required(),
            quantity: Joi.number().required(),
            categoryId: Joi.string().required(),
        //    ratings: Joi.array()
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


const productCategoryValidation = (userInputs, field = false) => {

    const fieldToPatch = Object.keys(userInputs);
    let schema = {
            name: Joi.string()
            .min(2)
            .required(),
            description: Joi.string()
            .min(2)
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
    productValidation,
    productCategoryValidation
}