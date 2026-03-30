import { TypeRedisKeyEnum } from "../enum/redis.enum.js";
import { generateHash, generateOTP, emailEmitter, ConflictException } from "../Utils/index.js";
import { blockKey, deleteKey, get, increment, otpKey, otpMaxRequestKey, set, ttl } from "./redis.service.js";

export const generateOtpAndSendOtpEmail = async ({ email, expiredTime = 2, title = TypeRedisKeyEnum.ConfirmEmail, subject = "Verify your email" }) => {
    const code = generateOTP();
    await set({
        key: otpKey({ email, type: title }),
        value: await generateHash(`${code}`),
        ttl: expiredTime * 60 //_ minutes
    })
    emailEmitter.emit("Otp", { to: email, subject, code, title, expiredTime })
    return;
}
export const isOtpExpired = async ({ email, type = TypeRedisKeyEnum.ConfirmEmail }) => {
    /*
  
     *  > 0 → Remaining time in seconds
     *  -1 → Key exists but has no expiration
     *  -2 → Key does not exist
     * 
  
    */
    const remainingTime = await ttl(otpKey({ email, type }));
    if (remainingTime > 0) {
        throw ConflictException({ message: `OTP has not expired, please wait for ${remainingTime} seconds` })
    }
    return;
}


export const maxOtpRequest = async ({ email, type = TypeRedisKeyEnum.ConfirmEmail, expiredTime = 5 }) => {
    if (await get(otpMaxRequestKey({ email, type }))) {
        await increment(otpMaxRequestKey({ email, type }))
        if (await get(otpMaxRequestKey({ email, type })) > 5) {
            //block
            await set({
                key: blockKey({ email, type }),
                value: true,
                ttl: expiredTime * 60 //_ minutes
            })
            //reset max request
            await deleteKey(otpMaxRequestKey({ email, type }))
            //throw error for user to wait 5 minutes before trying again
            throw ConflictException({ message: `You have been banned, please wait for ${await ttl(blockKey({ email, type }))} seconds` }) 

        }
    } else {
        await set({
            key: otpMaxRequestKey({ email, type }),
            value: 1
        })
    }

}


export const isBlocked = async ({ email, type = TypeRedisKeyEnum.ConfirmEmail }) => {
    const remainingBlock = await ttl(blockKey({ email, type }));
    if (remainingBlock > 0) {
        throw ConflictException({ message: `Your account has been blocked, please wait for ${remainingBlock} seconds` })
    }
    return;
}
