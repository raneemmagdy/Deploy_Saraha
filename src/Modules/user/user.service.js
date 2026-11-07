import { RedisKeyEnum } from "../../Common/enum/redis.enum.js";
import { BadRequestException, compareHash, ConflictException, decrypt, deleteOne } from "../../Common/index.js";
import {
  deleteFile,
  deleteFilesWithPublicIds,
  deleteFolder,
  deleteFolderAssets,
  uploadFile,
  uploadFiles,
} from "../../Common/Service/cloudinary.service.js";
import { generateOtpAndSendOtpEmail, isBlocked, isOtpExpired, maxOtpRequest } from "../../Common/Service/otp.service.js";
import { deleteKey, get, maxRequestKey, otpKey } from "../../Common/Service/redis.service.js";
import cloudinary from "../../Common/Utils/multer/cloudinary.js";
import {
  createLoginCredintials,
  generateToken,
  verifyToken,
} from "../../Common/Utils/security/token.security.js";
import {
  ACCESS_EXPIRES_IN,
  APPLICATION_NAME,
  REFRESH_EXPIRES_IN,
  USER_REFRESH_JWT_SECRET,
} from "../../config.js";
import { userModel } from "../../DB/Models/User.model.js";

export const deleteUser = async (user) => {
  // if (user.profileImage?.public_id) {
  //   await deleteFolderAssets({
  //     folderName: `${APPLICATION_NAME}/users/${user._id}/profile`,
  //   });
  //   await deleteFolder({
  //     folderName: `${APPLICATION_NAME}/users/${user._id}/profile`,
  //   });
  // }
  // if (user.coverImages?.length) {
  //   await deleteFolderAssets({
  //     folderName: `${APPLICATION_NAME}/users/${user._id}/cover`,
  //   });
  //   await deleteFolder({
  //     folderName: `${APPLICATION_NAME}/users/${user._id}/cover`,
  //   });
  // }

  // if (user.coverImages?.length || user.profileImage) {
  //   await deleteFolder({
  //     folderName: `${APPLICATION_NAME}/users/${user._id}`,
  //   });
  // }
  const baseFolder = `${APPLICATION_NAME}/users/${user._id}`;
  const folders = [];
  if (user.profileImage?.public_id) {
    folders.push(`${baseFolder}/profile`);
  }
  if (user.coverImages?.length) {
    folders.push(`${baseFolder}/cover`);
  }
  if (folders.length) {
    await deleteFolderAssets({ folderName: baseFolder });
    await deleteFolder({ folderName: baseFolder });
  }
  await deleteOne({ model: userModel, filter: { _id: user._id } });
  return "user deleted successfully";
};
export const profile = async (user) => {
  if (user.phone) {
    user.phone = decrypt(user.phone);
  }
  return user;
};
//                  current                          AccessExpiresIn
//--------------------/------------------------------/------------------
export const rotateToken = async (payload, user, issuer) => {
  //     const accessExpiresAtMS = (payload.iat + ACCESS_EXPIRES_IN) * 1000; // in ms

  //   if (Date.now() < accessExpiresAtMS) {
  //     throw BadRequestException({ message: "Access token is still valid" });
  //   }
  const { access_token, refresh_token } = await createLoginCredintials(
    user,
    issuer,
  );
  return { access_token, refresh_token };
};

export const uploadProfileImage = async (user, file) => {
  console.log({ file });

  // if (user.profileImage?.public_id) {
  //   await deleteFile({ public_id: user.profileImage.public_id });
  // }
  // const { public_id, secure_url } = await uploadFile({
  //   filePath: file.path,
  //   folder: `${APPLICATION_NAME}/users/${user._id}/profile`,
  // });
  // console.log({ public_id, secure_url });

  // user.profileImage = {
  //   public_id: file.public_id,
  //   secure_url: file.secure_url,
  // };
  // await user.save();
  // return user;
};
export const uploadCoverImages = async (user, files) => {
  console.log({ files });
  const result = files.map((file) => {
    return {
      secure_url: file.secure_url,
      public_id: file.public_id,
    };
  });

  // if (user.coverImages?.length) {
  //   await deleteFilesWithPublicIds({
  //     public_ids: user.coverImages.map((item) => item.public_id),
  //   });
  // }
  // user.coverImages = await uploadFiles({
  //   files,
  //   folder: `${APPLICATION_NAME}/users/${user._id}/Cover`,
  // });

  user.coverImages = result;
  await user.save();
  return user;
};
export const uploadFielsTest = async (user, files) => {
  console.log(files);
};

//==============================================send2FACode
export const send2FACode = async (user, firstTick = true) => {
  if (firstTick) {
    if (user.isTwoStepVerificationEnabled) {
      throw ConflictException({ message: "2FA already enabled" });
    }
  }
  await isBlocked({
    email: user.email,
    type: RedisKeyEnum.TwoStepsVerification,
  });
  await isOtpExpired({
    email: user.email,
    type: RedisKeyEnum.TwoStepsVerification,
  });
  await maxOtpRequest({
    email: user.email,
    type: RedisKeyEnum.TwoStepsVerification,
  });

  await generateOtpAndSendOtpEmail({
    email: user.email,
    title: RedisKeyEnum.TwoStepsVerification,
    subject: firstTick ? "Enable 2FA" : "Code for 2FA",
  });
  return "OTP sent to your email";
};
//==============================================enable2FA
export const enable2FA = async (body, user, firstTick = true) => {
  const { otp } = body;
  await isBlocked({
    email: user.email,
    type: RedisKeyEnum.TwoStepsVerification,
  });

  if (firstTick) {
    if (user.isTwoStepVerificationEnabled) {
      throw ConflictException({ message: "2FA already enabled" });
    }
  }
  const savedOtp = await get(
    otpKey({ email: user.email, type: RedisKeyEnum.TwoStepsVerification }),
  );
  if (!savedOtp) {
    throw BadRequestException({
      message: "otp has expired, please request a new one",
    });
  }
  const isValid = await compareHash(otp, savedOtp);
  if (!isValid) {
    throw BadRequestException({ message: "invalid otp code" });
  }
  if (firstTick) {
    user.isTwoStepVerificationEnabled = true;
    await user.save();
  }
  await deleteKey([
    otpKey({ email: user.email, type: RedisKeyEnum.TwoStepsVerification }),
    maxRequestKey({
      email: user.email,
      type: RedisKeyEnum.TwoStepsVerification,
    }),
  ]);
  return firstTick
    ? "2FA enabled successfully"
    : "user logged in successfully with 2FA";
};
