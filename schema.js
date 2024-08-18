const Joi = require('joi');

module.exports.listSchema = Joi.object({
    list: Joi.object({
        task: Joi.string().required()
    }).required()
});
