import multer from "multer";

//==============================================globaLErrorHandler
export const globaLErrorHandler = (error, req, res, next) => {
    let statusCode = error.cause?.statusCode || 500
    if(error instanceof multer.MulterError) {
        statusCode = 400
    }
    return res.status(statusCode).json({
        err_message: error.message,
        statusCode,
        errors: error.cause?.errors || undefined,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        error: process.env.NODE_ENV === "development" ? error : undefined
    });
}

//==============================================ErrorException
export const ErrorException = ({ message = "fail", cause = { statusCode: 500 } }) => {
    throw new Error(message, { cause })
}

//==============================================NotFoundException
export const NotFoundException = ({ message = "not found", extra = {} }) => {
    return ErrorException({ message, cause: { statusCode: 404, extra } })
}

//==============================================BadRequestException
export const BadRequestException = ({ message = "bad request", errors = undefined }) => {
    return ErrorException({ message, cause: { statusCode: 400, errors } })
}

//==============================================BadRequestException
export const ForbiddenException = ({ message = "forbidden resource", extra = {} }) => {
    return ErrorException({ message, cause: { statusCode: 403, extra } })
}

//==============================================ConflictException
export const ConflictException = ({ message = "conflict", extra = {} }) => {
    return ErrorException({ message, cause: { statusCode: 409, extra } })
}

//==============================================UnauthorizedException
export const UnauthorizedException = ({ message = "unauthorized", extra = {} }) => {
    return ErrorException({ message, cause: { statusCode: 401, extra } })
}