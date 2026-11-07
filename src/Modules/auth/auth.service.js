import { RedisKeyEnum } from "../../Common/enum/redis.enum.js";
import {
  BadRequestException,
  compareHash,
  ConflictException,
  create,
  encrypt,
  findOne,
  generateHash,
  NotFoundException,
  ProviderEnum,
} from "../../Common/index.js";
import {
  generateOtpAndSendOtpEmail,
  isBlocked,
  isOtpExpired,
  maxOtpRequest,
} from "../../Common/Service/otp.service.js";
import {
  blockKey,
  deleteKey,
  get,
  maxRequestKey,
  otpKey,
} from "../../Common/Service/redis.service.js";
import { createLoginCredintials } from "../../Common/Utils/security/token.security.js";
import { CLIENT_ID } from "../../config.js";
import { userModel } from "../../DB/Models/index.js";
import { OAuth2Client } from "google-auth-library";
import { enable2FA, send2FACode } from "../user/user.service.js";

export const signup = async (body) => {
  const { firstName, lastName, email, password, phone, gender } = body;
  const checkUserExise = await findOne({
    model: userModel,
    filter: { email },
    options: { select: "email" },
  });
  if (checkUserExise) {
    throw ConflictException({ message: "Email already exists" });
  }
  await create({
    model: userModel,
    data: [
      {
        firstName,
        lastName,
        email,
        password: await generateHash(password),
        phone: encrypt(phone),
        provider: ProviderEnum.SYSTEM,
        gender,
      },
    ],
  });
  await generateOtpAndSendOtpEmail({ email });

  return "Done";
};

export const login = async (body, issuer) => {
  const { email, password } = body;
  const is2FA = false;
  const user = await findOne({
    model: userModel,
    filter: { email },
  });
  if (!user) {
    return NotFoundException({ message: "Invalid email or password" });
  }
  await isBlocked({ email, type: RedisKeyEnum.loginAttempts });

  if (!(await compareHash(password, user.password))) {
    await maxOtpRequest({ email, type: RedisKeyEnum.loginAttempts });

    return NotFoundException({ message: "Invalid email or password" });
  }
  await deleteKey(maxRequestKey({ email, type: RedisKeyEnum.loginAttempts }));
  if (user.isTwoStepVerificationEnabled) {
    const message = await send2FACode(user, false);
    return { message, is2FA: true };
  }
  return { data: await createLoginCredintials(user, issuer ), is2FA };
};
export const loginFor2FA = async (body, issuer) => {
  const { email, otp } = body;
  const user = await findOne({
    model: userModel,
    filter: {
      email,
      isConfirmed: { $exists: true },
      provider: ProviderEnum.SYSTEM,
    },
  });
  if (!user) {
    return NotFoundException({ message: "Invalid matching account" });
  }
  const message = await enable2FA({ otp }, user, false);
  return { data: await createLoginCredintials( user, issuer ), message };
};

//=============================================Verify Email
export const verifyEmail = async (body) => {
  const { email, otp } = body;
  const user = await findOne({
    model: userModel,
    filter: { email, provider: ProviderEnum.SYSTEM },
  });
  if (!user) {
    return NotFoundException({ message: "Account not found" });
  }
  if (user.isConfirmed) {
    return ConflictException({ message: "Email already verified" });
  }
  const confirmOtp = await get(otpKey({ email }));

  if (!confirmOtp) {
    return BadRequestException({
      message: "OTP has expired, please request a new one",
    });
  }

  const isValidOtp = await compareHash(otp, confirmOtp);
  if (!isValidOtp) {
    return BadRequestException({ message: "Invalid OTP code" });
  }

  user.isConfirmed = true;
  await user.save();
  await deleteKey([
    otpKey({ email }),
    blockKey({ email }),
    maxRequestKey({ email }),
  ]);
  return "Email verified successfully";
};
//=============================================Resend OTP
export const resendOtp = async (body) => {
  const { email } = body;

  const account = await findOne({
    model: userModel,
    filter: { email, provider: ProviderEnum.SYSTEM },
  });
  if (!account) {
    throw NotFoundException({ message: "Fail to find matching account" });
  }
  await isBlocked({ email });
  await isOtpExpired({ email });
  await maxOtpRequest({ email });
  await generateOtpAndSendOtpEmail({ email });
  return;
};

const client = new OAuth2Client();

async function verify({ idToken }) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

export const signupWithGoogle = async (body) => {
  const { idToken } = body;
  console.log({ idToken });
  const payload = await verify({ idToken });
  console.log({ payload });

  if (!payload?.email_verified) {
    throw BadRequestException({ message: "Email is not verified" });
  }

  const user = await findOne({
    model: userModel,
    filter: { email: payload.email },
  });
  if (user) {
    throw ConflictException({ message: "Email already exists" });
  }

  await create({
    model: userModel,
    data: [
      {
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        provider: ProviderEnum.GOOGLE,
        isConfirmed: true,
      },
    ],
  });
  return "User Created Successfully";
};
export const loginWithGoogle = async (body, issuer) => {
  const { idToken } = body;
  console.log({ idToken });
  const payload = await verify({ idToken });
  console.log({ payload });

  if (!payload) {
    throw BadRequestException({ message: "Invalid Credentials" });
  }

  const user = await findOne({
    model: userModel,
    filter: { email: payload.email, isConfirmed: true },
  });
  if (!user) {
    throw NotFoundException({
      message: "User not found,please signup first with google",
    });
  }
  if (user.provider !== ProviderEnum.GOOGLE) {
    throw BadRequestException({
      message: "you have signup with another provider",
    });
  }
  return await createLoginCredintials(user, issuer);
};
export const loginOrSignupWithGoogle = async (body, issuer) => {
  const { idToken } = body;
  console.log({ idToken });
  const payload = await verify({ idToken });
  console.log({ payload });

  if (!payload.email_verified) {
    throw BadRequestException({ message: "Email is not verified" });
  }
  const user = await findOne({
    model: userModel,
    filter: { email: payload.email, isConfirmed: true },
  });
  if (user) {
    if (user.provider === ProviderEnum.GOOGLE) {
      return {
        status: 200,
        credentials: await createLoginCredintials(user, issuer),
      };
    }
    throw ConflictException({
      message: "Email already exists,please login with system credentials",
    });
  }

  const [newUser] = await create({
    model: userModel,
    data: [
      {
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        provider: ProviderEnum.GOOGLE,
        isConfirmed: true,
      },
    ],
  });
  return {
    status: 201,
    credentials: await createLoginCredintials(newUser, issuer),
  };
};
