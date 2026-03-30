import { CLIENT_ID } from "../../../config/config.service.js";
import { deleteKey, get, otpKey, BadRequestException, compareHash, ConflictException, createLoginCredentials, encrypt, generateHash, NotFoundException, ProviderEnum, blockKey, otpMaxRequestKey, generateOtpAndSendOtpEmail, isBlocked, isOtpExpired, maxOtpRequest, TypeRedisKeyEnum } from "../../Common/index.js";
import { create, findOne } from "../../DB/db.service.js";
import { userModel } from "../../DB/Models/index.js";
import { OAuth2Client } from 'google-auth-library';
import { enable2FA, send2FACode } from "../user/user.service.js";
//=============================================Signup
export const signup = async (body) => {
    const { firstName, lastName, email, password, phone, DOB, gender } = body;
    const checkUserExise = await findOne({
        model: userModel,
        filter: { email },
        select: "email"
    });
    if (checkUserExise) {
        return ConflictException({ message: "Email already exists" });
    }
    await create({
        model: userModel,
        data: [{
            firstName,
            lastName,
            email,
            password: await generateHash(password),
            phone: await encrypt(phone),
            provider: ProviderEnum.System,
            DOB,
            gender
        }],
    });
    await generateOtpAndSendOtpEmail({ email });
    return "Done";
};

//=============================================Verify Email
export const verifyEmail = async (body) => {
    const { email, otp } = body;
    const user = await findOne({
        model: userModel,
        filter: { email, provider: ProviderEnum.System },
    });
    if (!user) {
        return NotFoundException({ message: "Account not found" });
    }
    if (user.isConfirmed) {
        return ConflictException({ message: "Email already verified" });
    }
    const confirmOtp = await get(otpKey({ email }));

    if (!confirmOtp) {
        return BadRequestException({ message: "OTP has expired, please request a new one" });
    }

    const isValidOtp = await compareHash(otp, confirmOtp);
    if (!isValidOtp) {
        return BadRequestException({ message: "Invalid OTP code" });
    }

    user.isConfirmed = true;
    await user.save();
    await deleteKey([otpKey({ email }), blockKey({ email }), otpMaxRequestKey({ email })]);
    return "Email verified successfully";
};
//=============================================Resend OTP
export const resendOtp = async (body) => {
    const { email } = body;

    const account = await findOne({
        model: userModel,
        filter: { email, provider: ProviderEnum.System }
    })
    if (!account) {
        throw NotFoundException({ message: "Fail to find matching account" })
    }
    await isBlocked({ email })
    await isOtpExpired({ email })
    await maxOtpRequest({ email })
    await generateOtpAndSendOtpEmail({ email })
    return;
};

//=============================================Login
export const login = async (body, issuer) => {
    const { email, password } = body;
    let is2FA = false
    const user = await findOne({
        model: userModel,
        filter: { email, isConfirmed: { $exists: true }, provider: ProviderEnum.System },
    });
    if (!user) {
        return NotFoundException({ message: "Invalid email or password" });
    }
    await isBlocked({ email, type: TypeRedisKeyEnum.loginAttempts })
    if (!await compareHash(password, user.password)) {
        await maxOtpRequest({ email, type: TypeRedisKeyEnum.loginAttempts })
        return NotFoundException({ message: "Invalid email or password" });
    }
    await deleteKey(otpMaxRequestKey({ email, type: TypeRedisKeyEnum.loginAttempts }))
    if (user.isTwoStepVerificationEnabled) {
        const message = await send2FACode(user, false)
        return { message, is2FA: true }
    }
    return { data: await createLoginCredentials({ user, issuer }), is2FA }
};
//=============================================LoginFor2FA
export const loginFor2FA = async (body, issuer) => {
    const { email, otp } = body
    const user = await findOne({
        model: userModel,
        filter: { email, isConfirmed: { $exists: true }, provider: ProviderEnum.System },
    })
    if (!user) {
        return NotFoundException({ message: "Invalid matching account" });
    }
    const message= await enable2FA({ otp }, user, false)
    return { data: await createLoginCredentials({ user, issuer }), message }
};


//=============================================Google
const client = new OAuth2Client();
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload
}
export const googleSignup = async (body) => {
    const { idToken } = body
    console.log({ idToken });

    const payload = await verify(idToken)
    console.log({ payload });
    if (!payload.email_verified) {
        throw BadRequestException({ message: "Email is not verified" })
    }
    const user = await findOne({
        model: userModel,
        filter: { email: payload.email }
    })

    if (user) {
        throw ConflictException({ message: "Email already exists" })
    }
    await create({
        model: userModel,
        data: [{
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
            provider: ProviderEnum.Google,
            isConfirmed: true
        }]
    })

    return "User created successfully"


};
export const googleLogin = async (body, issuer) => {
    const { idToken } = body
    console.log({ idToken });

    const payload = await verify(idToken)
    console.log({ payload });
    if (!payload) {
        throw BadRequestException({ message: "Invalid credetials" })
    }
    const user = await findOne({
        model: userModel,
        filter: {
            email: payload.email,
            provider: ProviderEnum.Google,
            isConfirmed: { $exists: true }
        }
    })
    if (!user) {
        throw BadRequestException({ message: "Invalid credetials" })
    }
    return await createLoginCredentials({ user, issuer })

};
export const googleSignupAndLogin = async (body, issuer) => {
    const { idToken } = body
    const payload = await verify(idToken)
    if (!payload.email_verified) {
        throw BadRequestException({ message: "Email is not verified" })
    }
    const user = await findOne({
        model: userModel,
        filter: { email: payload.email }
    })
    if (user) {
        if (user.provider === ProviderEnum.Google) {
            return { credentials: await createLoginCredentials({ user, issuer }), isNew: false }
        }
        throw ConflictException({ message: "Email already exists, please login with system credentials" })
    }

    const [newUser] = await create({
        model: userModel,
        data: [{
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
            provider: ProviderEnum.Google,
            isConfirmed: true
        }]
    })
    const credentials = await createLoginCredentials({ user: newUser, issuer })
    return { credentials, isNew: true }
};

