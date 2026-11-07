import {
  BadRequestException,
  findById,
  NotFoundException,
  TokenTypeEnum,
  UnauthorizedException,
} from "../Common/index.js";
import {
  decodeToken,
  verifyToken,
} from "../Common/Utils/security/token.security.js";

export const authenticationMiddleware = (tokenType = TokenTypeEnum.ACCESS) => {
  return async (req, res, next) => {

    const { authorization } = req.headers;
    if (!authorization) {
      throw UnauthorizedException({ message: "you are not authenticated" });
    }
    
    const {user, payload} = await decodeToken({
      authorization,
      tokenType,
      issuer: `${req.protocol}://${req.host}`,
    });
    req.user = user;
    req.payload = payload;
    next();
  };
};
