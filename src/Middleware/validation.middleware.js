import { BadRequestException } from "../Common/Utils/response/index.js";

export const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = []
        for (const key of Object.keys(schema)) {
            const validationError = schema[key].validate(req[key], { abortEarly: false })
            
            if (validationError?.error) {
                const result=validationError.error.details.map((detail) => {
                    return {
                        message: detail.message,
                        path: detail.path
                    }
                })
                console.log({result});
                
                validationErrors.push(...result)
            }
        }
        if (validationErrors.length > 0) {
            return BadRequestException({ message: "Validation error", errors: validationErrors })

        }
        next()
    }

}