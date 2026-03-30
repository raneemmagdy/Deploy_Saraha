import { Router } from "express";
import * as userService from "./user.service.js"
import * as userValidation from "./user.validation.js"
import { cloudFileUpload, successResponse } from "../../Common/index.js";
import { authentication } from "../../Middleware/authentication.middleware.js";
import { fileFieldValidation } from "../../Common/Utils/multer/multer.validation.js";
import { validation } from "../../Middleware/validation.middleware.js";
const userRouter = Router()
//==============================================deleteUser
userRouter.delete('/', authentication(), async (req, res) => {
    const message = await userService.deleteUser(req.user)
    return successResponse({ res, message })
})
//==============================================deleteUser
userRouter.get('/profile', authentication(), async (req, res) => {
    const data = await userService.profile(req.user)
    return successResponse({ res, data })
})
//==============================================uploadProfilePicture
userRouter.patch('/profile', authentication(),
    cloudFileUpload({ validation: fileFieldValidation.image }).single('profilePicture'),
    validation(userValidation.uploadProfilePicSchema),
    async (req, res) => {
        const message = await userService.uploadProfilePic(req.file, req.user)
        return successResponse({ res, message })
    })
//==============================================uploadCoverPicture
userRouter.patch('/cover',
    authentication(),
    cloudFileUpload({ validation: fileFieldValidation.image }).array('coverPicture', 2),
    validation(userValidation.uploadCoverPicSchema),
    async (req, res) => {
        const message = await userService.uploadCoverPic(req.files, req.user)
        return successResponse({ res, message })
    })
//==============================================send2FACode
userRouter.post('/two-step-verification', authentication(), async (req, res) => {
    const message = await userService.send2FACode(req.user)
    return successResponse({ res, message })
})
//==============================================enable2FA
userRouter.post('/two-step-verification/enable', authentication(), validation(userValidation.otpSchema), async (req, res) => {
    const message = await userService.enable2FA(req.body, req.user)
    return successResponse({ res, message })
})

export default userRouter