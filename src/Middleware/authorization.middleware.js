import { ForbiddenException } from "../Common/index.js";

export const authorization = (accessRoles = []) => {
    return async (req, res, next) => {
        console.log(req.user.role);
        if (!accessRoles.includes(req.user.role)) {
            throw ForbiddenException({ message: "Unauthorized" })
        }
        next()
    }
}