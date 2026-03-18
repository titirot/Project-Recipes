const Joi = require('joi');

const recipeValidator = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).required(),
        description: Joi.string(),
        preparationTime: Joi.number().min(1).required(),
        level: Joi.number().min(1).max(5),
        layers: Joi.array().items(Joi.object({
            description: Joi.string().required(),
            ingredients: Joi.array().items(Joi.string()).required()
        })),
        instructions: Joi.array().items(Joi.string()),
        image: Joi.string(),
        isPrivate: Joi.boolean(),
        owner: Joi.string() // המזהה של המשתמש כמחרוזת
    });
    return schema.validate(data);
};

module.exports = recipeValidator;