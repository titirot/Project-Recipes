const Joi = require('joi');
const objectIdRule = Joi.string().hex().length(24);

const recipeValidator = (data) => {
    const schema = Joi.object({
        code: Joi.number().integer().positive().required(),
        name: Joi.string().min(2).required(),
        description: Joi.string(),
        categories: Joi.array().items(objectIdRule),
        preparationTime: Joi.number().min(1).required(),
        level: Joi.number().min(1).max(5),
        layers: Joi.array().items(Joi.object({
            description: Joi.string().required(),
            ingredients: Joi.array().items(Joi.string()).required()
        })),
        instructions: Joi.array().items(Joi.string()),
        image: Joi.string(),
        isPrivate: Joi.boolean(),
        owner: objectIdRule
    });
    return schema.validate(data);
};

module.exports = recipeValidator;