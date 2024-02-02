import Joi from "joi";

const memberID = Joi.number().integer().min((10 ** 6) - 1).required();
const requiredString = Joi.string().required();

const RegisterFormSchema = Joi.object({
    memberid: memberID,

    first_name: requiredString,
    last_name: requiredString,
    username: requiredString,
    password: requiredString,
})

const LoginFormSchema = Joi.object({
    memberid: memberID,

    username: requiredString,
    password: requiredString,
})

export { LoginFormSchema, RegisterFormSchema };

