import { Router } from "express";
import * as userService from "./user.service.js";
import * as userValidation from "./user.validation.js";
import {
  fileValidation,
  localFileUpload,
  RoleEnum,
  successResponse,
  TokenTypeEnum,
} from "../../Common/index.js";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";
import { authorizationMiddleware } from "../../Middleware/authorization.middleware.js";
import { uploadMiddleware } from "../../Middleware/multer.middleware.js";
import { cloudFileUpload } from "../../Common/Utils/multer/cloud.multer.js";
import { APPLICATION_NAME } from "../../config.js";
import { validation } from "../../Middleware/validation.middleware.js";

const userRouter = Router();
//==============================================deleteUser
userRouter.delete("/", authenticationMiddleware(), async (req, res) => {
  const message = await userService.deleteUser(req.user);
  return successResponse({ res, message });
});
//==============================================profile
userRouter.get("/profile", authenticationMiddleware(), async (req, res) => {
  const data = await userService.profile(req.user);
  return successResponse({ res, data });
});
//==============================================rotateToken
userRouter.post(
  "/rotate-token",
  authenticationMiddleware(TokenTypeEnum.REFRESH),
  async (req, res) => {
    const data = await userService.rotateToken(
      req.payload,
      req.user,
      `${req.protocol}://${req.host}`,
    );
    return successResponse({ res, data });
  },
);
//==============================================uploadImage
userRouter.patch(
  "/profile-image",
  authenticationMiddleware(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({ maxFileSize: 2 }).single("attachment"),
    customPath: "users",
    validation: fileValidation.image,
  }),
  // uploadMiddleware({
  //   multerMiddleware: cloudFileUpload({ maxFileSize: 2 }).single("attachment"),
  //   customPath: (req) => `${APPLICATION_NAME}/users/${req.user._id}/profile`,
  //   validation: fileValidation.image,
  //   cloud: true,
  // }),
  // cloudFileUpload({ maxFileSize: 2 }).single("attachment"),
  async (req, res, next) => {
    const data = await userService.uploadProfileImage(req.user, req.file);
    return successResponse({ res, data });
  },
);
//==============================================uploadImage
userRouter.patch(
  "/cover-images",
  authenticationMiddleware(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({ maxFileSize: 2 }).array(
      "attachments",
      2,
    ),
    customPath: "covers",
    validation: fileValidation.image,
  }),
  // uploadMiddleware({
  //   multerMiddleware: cloudFileUpload({ maxFileSize: 2 }).array(
  //     "attachments",
  //     2,
  //   ),
  //   customPath: (req) => `${APPLICATION_NAME}/users/${req.user._id}/cover`,
  //   validation: fileValidation.image,
  //   cloud: true,
  // }),
  // cloudFileUpload({ maxFileSize: 2 }).array("attachments", 2),
  async (req, res, next) => {
    const data = await userService.uploadCoverImages(req.user, req.files);
    return successResponse({ res, data });
  },
);
//==============================================uploadImage
userRouter.patch(
  "/fields",
  authenticationMiddleware(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({ maxFileSize: 2 }).fields([
      { name: "profileImage", maxCount: 1 },
      { name: "coverImages", maxCount: 2 },
    ]),
    customPath: "covers",
    validation: fileValidation.image,
  }),
  // uploadMiddleware({
  //   multerMiddleware: cloudFileUpload({ maxFileSize: 2 }).fields([
  //     { name: "profileImage", maxCount: 1 },
  //     { name: "coverImages", maxCount: 2 },
  //   ]),
  //   customPath: (req) => `${APPLICATION_NAME}/users/${req.user._id}/cover`,
  //   validation: fileValidation.image,
  //   cloud: true,
  // }),
  // cloudFileUpload({ maxFileSize: 2 }).array("attachments", 2),
  async (req, res, next) => {
    const data = await userService.uploadFielsTest(req.user, req.files);
    return successResponse({ res, data });
  },
);
userRouter.post(
  "/two-step-verification",
  authenticationMiddleware(),
  async (req, res) => {
    const message = await userService.send2FACode(req.user);
    return successResponse({ res, message });
  },
);
//==============================================enable2FA
userRouter.post(
  "/two-step-verification/enable",
  authenticationMiddleware(),
  validation(userValidation.otp),
  async (req, res) => {
    const message = await userService.enable2FA(req.body, req.user);
    return successResponse({ res, message });
  },
);
export default userRouter;
