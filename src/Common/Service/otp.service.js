import { RedisKeyEnum } from "../enum/redis.enum.js";
import { ConflictException } from "../Exceptions/error.exception.js";
import {
  generateHash,
  generateOTP,
  emailEmitter,
} from "../Utils/index.js";
import {
  blockKey,
  deleteKey,
  get,
  increment,
  otpKey,
  maxRequestKey,
  set,
  ttl,
} from "./redis.service.js";

export const generateOtpAndSendOtpEmail = async ({
  email,
  expiredTime = 0.5,
  title = RedisKeyEnum.ConfirmEmail,
  subject = "Verify your email",
}) => {
  const code = generateOTP();
  await set({
    key: otpKey({ email, type: title }),
    value: await generateHash(`${code}`),
    ttl: expiredTime * 60, //_ minutes
  });
  emailEmitter.emit("Otp", { to: email, subject, code, title, expiredTime });
  return;
};
export const isOtpExpired = async ({
  email,
  type = RedisKeyEnum.ConfirmEmail,
}) => {
  /*
  
     *  > 0 → Remaining time in seconds
     *  -1 → Key exists but has no expiration
     *  -2 → Key does not exist
     * 
  
    */
  const remainingTime = await ttl(otpKey({ email, type }));
  if (remainingTime > 0) {
    throw ConflictException({
      message: `OTP has not expired, please wait for ${remainingTime} seconds`,
    });
  }
  return;
};

export const maxOtpRequest = async ({
  email,
  type = RedisKeyEnum.ConfirmEmail,
  expiredTime = 5,
}) => {
  if (await get(maxRequestKey({ email, type }))) {
    await increment(maxRequestKey({ email, type }));
    if ((await get(maxRequestKey({ email, type }))) > 5) {
      //block
      await set({
        key: blockKey({ email, type }),
        value: true,
        ttl: expiredTime * 60, //_ minutes
      });
      //reset max request
      await deleteKey(maxRequestKey({ email, type }));
      //throw error for user to wait 5 minutes before trying again
      throw ConflictException({
        message: `You have been banned, please wait for ${await ttl(blockKey({ email, type }))} seconds`,
      });
    }
  } else {
    await set({
      key: maxRequestKey({ email, type }),
      value: 1,
    });
  }
};

export const isBlocked = async ({
  email,
  type = RedisKeyEnum.ConfirmEmail,
}) => {
  const remainingBlock = await ttl(blockKey({ email, type }));
  if (remainingBlock > 0) {
    throw ConflictException({
      message: `Your account has been blocked, please wait for ${remainingBlock} seconds`,
    });
  }
  return;
};
