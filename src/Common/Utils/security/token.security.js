import jwt from "jsonwebtoken";
import { AudienceEnum, RoleEnum, TokenTypeEnum } from "../../enum/index.js";
import { BadRequestException, UnauthorizedException } from "../response/index.js";
import { ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN, SYSTEM_ACCESS_JWT_SECRET, SYSTEM_REFRESH_JWT_SECRET, USER_ACCESS_JWT_SECRET, USER_REFRESH_JWT_SECRET } from "../../../../config/config.service.js";
import { userModel } from "../../../DB/Models/User.model.js";
import { findOne } from "../../../DB/db.service.js";
//=================================Generate Token===============================
export const generateToken = async ({
  payload = {},
  secret = USER_ACCESS_JWT_SECRET,
  options = {},
} = {}) => {
  return jwt.sign(payload, secret, options);
};
//=================================Verify Token===============================

export const verifyToken = async ({
  token,
  secret = USER_ACCESS_JWT_SECRET,
} = {}) => {
  return jwt.verify(token, secret);
};
//=================================Get Token Signature===============================
export const getTokenSignature = async (role) => {
    let accessSignature = undefined;
    let refreshSignature = undefined;
    let audience = AudienceEnum.User
    switch (role) {
        case RoleEnum.Admin:
            accessSignature = SYSTEM_ACCESS_JWT_SECRET;
            refreshSignature = SYSTEM_REFRESH_JWT_SECRET;
            audience = AudienceEnum.System
            break;
        default:
            accessSignature = USER_ACCESS_JWT_SECRET;
            refreshSignature = USER_REFRESH_JWT_SECRET;
            audience = AudienceEnum.User
            break;
    }
    return { accessSignature, refreshSignature, audience }
};
//=================================Get Token Signature===============================
export const getSignatureLevel = async (audienceType) => {
    let signatureLevel = AudienceEnum.User;
    switch (audienceType) {
        case AudienceEnum.System:
            signatureLevel = RoleEnum.Admin
            break;
        default:
            signatureLevel = RoleEnum.User
            break;
    }
    return signatureLevel
};
//=================================Create Login Credentials===============================
export const createLoginCredentials = async ({ user, issuer }) => {

    const { accessSignature, refreshSignature, audience } = await getTokenSignature(user.role)

    const access_token = await generateToken({
        payload: { sub: user._id },
        secret: accessSignature,
        options: {
            issuer,
            audience: [TokenTypeEnum.ACCESS, audience],
            expiresIn: ACCESS_EXPIRES_IN
        }
    })
    const refresh_token = await generateToken({
        payload: { sub: user._id },
        secret: refreshSignature,
        options: {
            issuer,
            audience: [TokenTypeEnum.REFRESH, audience],
            expiresIn: REFRESH_EXPIRES_IN
        }
    })
    return { access_token, refresh_token }
}
//=================================Decode Token===============================
export const decodeToken = async ({ token, tokenType = TokenTypeEnum.ACCESS } = {}) => {
    console.log({ token });

    const decode = jwt.decode(token)
    console.log({ decode });
    
    if (!decode?.aud?.length) {
        throw BadRequestException({ message: 'Fail to decoded this token audience is required' })
    }

    const [decodeTokenType, audienceType] = decode.aud;
    if (decodeTokenType !== tokenType) {
        throw BadRequestException({ message: `Invalid token type, token of type ${decodeTokenType} cannot access this api while we excpected token of type ${tokenType}` })
    }

    const signatureLevel = await getSignatureLevel(audienceType)
    const { accessSignature, refreshSignature } = await getTokenSignature(signatureLevel)
    console.log({ accessSignature, refreshSignature });

    const verifiedData = await verifyToken({
        token,
        secret: tokenType == TokenTypeEnum.REFRESH ? refreshSignature : accessSignature
    })
    console.log({verifiedData});
    

    const user = await findOne({ model: userModel, filter: { _id: verifiedData.sub } })
    if (!user) {
        throw UnauthorizedException({ message: `Not register account` })
    }
    return user
}