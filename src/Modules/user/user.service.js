import { APPLICATION_NAME } from "../../../config/config.service.js"
import { BadRequestException, compareHash, ConflictException, decrypt, deleteFile, deleteFilesWithPublicIds, deleteFolder, deleteFolderAssets, deleteKey, generateOtpAndSendOtpEmail, get, isBlocked, isOtpExpired, maxOtpRequest, otpKey, otpMaxRequestKey, TypeRedisKeyEnum, uploadFile, uploadFiles } from "../../Common/index.js"

import { deleteOne } from "../../DB/db.service.js"
import { userModel } from "../../DB/Models/index.js"

//==============================================deleteUser
export const deleteUser = async (user) => {
    const baseFolder = `${APPLICATION_NAME}/users/${user._id}`
    const folders = []
    if (user.profileImage?.public_id) {
        folders.push(`${baseFolder}/profile`)
    }
    if (user.coverPicture?.length) {
        folders.push(`${baseFolder}/cover`)
    }
    if (folders.length) {
        await deleteFolderAssets(baseFolder)
        await deleteFolder(baseFolder)
    }

    await deleteOne({ model: userModel, filter: { _id: user._id } })
    return "Done"
}
//==============================================profile
export const profile = async (user) => {
    return {
        userName: user.userName,
        email: user.email,
        phone: await decrypt(user.phone)
    }
}
//==============================================uploadProfilePic
export const uploadProfilePic = async (file, user) => {
    console.log({ file });
    if (user.profileImage?.public_id) {
        await deleteFile(user.profileImage.public_id)
    }
    const { public_id, secure_url } = await uploadFile({ filePath: file.path, folder: `${APPLICATION_NAME}/users/${user._id}/profile` })
    console.log({ public_id, secure_url });


    user.profileImage = { public_id, secure_url }
    await user.save()
    return "Done"
}
//==============================================uploadCoverPic
export const uploadCoverPic = async (files, user) => {
    if (user.coverPicture?.length) {
        await deleteFilesWithPublicIds(user.coverPicture.map(({ public_id }) => public_id))
    }
    user.coverPicture = await uploadFiles({ files, folder: `${APPLICATION_NAME}/users/${user._id}/cover` })
    await user.save()
    return "Done"
}
//==============================================send2FACode
export const send2FACode = async (user, firstTick = true) => {
    if (firstTick) {
        if (user.isTwoStepVerificationEnabled) {
            throw ConflictException({ message: "2FA already enabled" })
        }
    }
    await isBlocked({ email: user.email, type: TypeRedisKeyEnum.TwoStepsVerification })
    await isOtpExpired({ email: user.email, type: TypeRedisKeyEnum.TwoStepsVerification })
    await maxOtpRequest({ email: user.email, type: TypeRedisKeyEnum.TwoStepsVerification })
    await generateOtpAndSendOtpEmail({
        email: user.email,
        title: TypeRedisKeyEnum.TwoStepsVerification,
        subject: firstTick ? "Enable 2FA" : "Code for 2FA"
    })
    return "OTP sent to your email"

}
//==============================================enable2FA
export const enable2FA = async (body, user, firstTick = true) => {
    const { otp } = body
    await isBlocked({ email: user.email, type: TypeRedisKeyEnum.TwoStepsVerification })
    if (firstTick) {
        if (user.isTwoStepVerificationEnabled) {
            throw ConflictException({ message: "2FA already enabled" })
        }
    }
    const savedOtp = await get(otpKey({ email: user.email, type: TypeRedisKeyEnum.TwoStepsVerification }))
    if (!savedOtp) {
        throw BadRequestException({ message: "otp has expired, please request a new one" })
    }
    const isValid = await compareHash(otp, savedOtp)
    if (!isValid) {
        throw BadRequestException({ message: "invalid otp code" })
    }
    if (firstTick) {
        user.isTwoStepVerificationEnabled = true
        await user.save()
    }
    await deleteKey([otpKey({ email: user.email, type: TypeRedisKeyEnum.TwoStepsVerification }), otpMaxRequestKey({ email: user.email, type: TypeRedisKeyEnum.TwoStepsVerification })])
    return firstTick ? "2FA enabled successfully" : "user logged in successfully with 2FA"
}
