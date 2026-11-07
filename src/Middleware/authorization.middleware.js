import { ForbiddenException } from "../Common/index.js";

export const authorizationMiddleware = (accessRoles = []) => {
  return async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      throw ForbiddenException({ message: "you are not authorized" });
    }
    next();
  };
};
