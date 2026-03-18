const Joi = require('joi');

const categoryValidator = (data) => {
    const schema = Joi.object({
        code: Joi.string().required(),
        description: Joi.string().min(3).required(),
        recipes: Joi.array().items(Joi.string())
    });
    return schema.validate(data);
};

module.exports = categoryValidator;