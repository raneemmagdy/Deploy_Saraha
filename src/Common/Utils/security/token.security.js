import jwt from "jsonwebtoken";
import {
  ACCESS_EXPIRES_IN,
  ADMIN_ACCESS_JWT_SECRET,
  ADMIN_REFRESH_JWT_SECRET,
  REFRESH_EXPIRES_IN,
  USER_ACCESS_JWT_SECRET,
  USER_REFRESH_JWT_SECRET,
} from "../../../config.js";
import { TokenTypeEnum } from "../../enum/security.enum.js";
import { findById } from "../../repository/db.repository.js";
import {
  BadRequestException,
  NotFoundException,
} from "../../Exceptions/error.exception.js";
import { userModel } from "../../../DB/Models/User.model.js";
import { RoleEnum } from "../../enum/user.enum.js";
//==================================generateToken=====================================
export const generateToken = async ({
  payload = {},
  options = {},
  SECRET_KEY = USER_ACCESS_JWT_SECRET,
}) => {
  return jwt.sign(payload, SECRET_KEY, options);
};
//==================================verifyToken=====================================
export const verifyToken = async ({
  token,
  options = {},
  SECRET_KEY = USER_ACCESS_JWT_SECRET,
}) => {
  return jwt.verify(token, SECRET_KEY, options);
};
//===================================getTokenSignatureByTokenType====================================
export const getTokenSignatureByTokenType = async ({ tokenType, role }) => {
  const signature = await getTokenSignatureByRole(role); //{ access: ...._ACCESS_JWT_SECRET, refresh: ...._REFRESH_JWT_SECRET }
  return tokenType === TokenTypeEnum.ACCESS
    ? signature.access
    : signature.refresh;
};
//==================================decodeToken=====================================
export const decodeToken = async ({ authorization, tokenType, issuer }) => {
  const decoded = jwt.decode(authorization);
  if (!decoded?.aud?.length) {
    throw BadRequestException({ message: "audience is missing" });
  }
  console.log({ decoded });

  const payload = await verifyToken({
    token: authorization,
    SECRET_KEY: await getTokenSignatureByTokenType({
      tokenType,
      role: decoded.aud[0],
    }),
    options: { issuer },
  });
  console.log({ payload });
  if (!payload?.sub) {
    throw BadRequestException({ message: "invalid token payload" });
  }

  const user = await findById({ model: userModel, id: payload.sub });
  if (!user) {
    throw NotFoundException({ message: "user not found" });
  }
  return { user, payload };
};

//===============================================getTokenSignatureByRole==================================
export const getTokenSignatureByRole = async (role = RoleEnum.USER) => {
  let signature = {};
  switch (role) {
    case RoleEnum.ADMIN:
      signature = {
        access: ADMIN_ACCESS_JWT_SECRET,
        refresh: ADMIN_REFRESH_JWT_SECRET,
      };
      break;
    default:
      signature = {
        access: USER_ACCESS_JWT_SECRET,
        refresh: USER_REFRESH_JWT_SECRET,
      };
      break;
  }

  console.log({ signature });
  return signature;
};
//==========================================createLoginCredintials==========================================
export const createLoginCredintials = async (user, issuer) => {
  const signature = await getTokenSignatureByRole(user.role);
  const access_token = await generateToken({
    payload: { sub: user._id },
    SECRET_KEY: signature.access,
    options: { expiresIn: ACCESS_EXPIRES_IN, issuer, audience: [user.role] },
  });
  const refresh_token = await generateToken({
    payload: { sub: user._id },
    SECRET_KEY: signature.refresh,
    options: { expiresIn: REFRESH_EXPIRES_IN, issuer, audience: [user.role] },
  });

  return { access_token, refresh_token };
};
