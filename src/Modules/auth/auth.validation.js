import Joi from "joi";
import { GenderEnum } from "../../Common/index.js";
import { generalFields } from "../user/user.validation.js";

export const loginSchema = {
    body: Joi.object().keys({
        email: generalFields.email,
        password: generalFields.password
    })
}
export const signupSchema = {
    body: loginSchema.body.append({
        firstName: Joi.string().min(2).max(25).required().messages({
            "string.min": "First name must be at least 2 characters long",
            "string.max": "First name must be at most 25 characters long",
        }),
        lastName: Joi.string().min(2).max(25).required().messages({
            "string.min": "Last name must be at least 2 characters long",
            "string.max": "Last name must be at most 25 characters long",
        }),
        phone: Joi.string()
            .pattern(/^01[0125][0-9]{8}$/)
            .optional().messages({
                "string.pattern.base": "Phone number is not valid, please enter Egyptian phone number"
            }),
        DOB: Joi.date().less("now").optional(),
        gender: Joi.number()
            .valid(...Object.values(GenderEnum))
            .optional().messages({
                "any.only": `Gender must be one of ${Object.values(GenderEnum)}`
            }),


    })
}
export const verifyEmailSchema = {
    body: Joi.object().keys({
        email: generalFields.email,
        otp: generalFields.otp
    })
}
export const emailSchema = {
    body: Joi.object().keys({
        email: generalFields.email
    })
}

export const loginFor2FASchema={
    body: emailSchema.body.append({
        otp: generalFields.otp
    })
}
