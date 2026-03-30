import Joi from "joi";
import { fileFieldValidation } from "../../Common/Utils/multer/index.js";
export const generalFields = {
    file: function (mimetype) {
        return Joi.object().keys({
            fieldname: Joi.string(),
            originalname: Joi.string(),
            encoding: Joi.string(),
            mimetype: Joi.string().valid(...mimetype),
            // finalPath: Joi.string().required(),
            destination: Joi.string(),
            filename: Joi.string(),
            path: Joi.string(),
            size: Joi.number().required()
        })
    },
    email: Joi.string().email().required().messages({
        "string.email": "Email is not valid"
    }),
    password: Joi.string().required().pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/).messages({
        "string.pattern.base": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    }),
    otp: Joi.string().pattern(/^\d{6}$/).required().messages({
        "string.pattern.base": "OTP must be a 6-digit number"
    }),
}

export const uploadProfilePicSchema = {
    file: generalFields.file(fileFieldValidation.image).required()
}

export const uploadCoverPicSchema = {
    files: Joi.array().items(generalFields.file(fileFieldValidation.image)).min(1).max(2).required()
}

export const otpSchema={
    body: Joi.object().keys({
        otp: generalFields.otp
    })
}