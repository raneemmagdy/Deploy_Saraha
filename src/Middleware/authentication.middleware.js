import { BadRequestException, decodeToken, TokenTypeEnum } from "../Common/index.js"

export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {

    return async (req, res, next) => {

        if (!req?.headers?.authorization) {
            throw BadRequestException({ message: "Authorization header is required" })
        }
        console.log({ headers: req?.headers?.authorization });

        const user = await decodeToken({ tokenType, token: req?.headers?.authorization })
        req.user = user
        next()
    }
}