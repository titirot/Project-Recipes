const Joi = require('joi');

const userValidator = (data) => {
    const schema = Joi.object({
        userName: Joi.string().min(2).required(),
        password: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)
            .required()
            .messages({
                'string.pattern.base':
                    'Password must include uppercase, lowercase, number, and special character'
            }),
        email: Joi.string().email().required(),
        address: Joi.string(),
        role: Joi.string().valid('admin', 'registered', 'user')
    });
    return schema.validate(data);
};

module.exports = userValidator;