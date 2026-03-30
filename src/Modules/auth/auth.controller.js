import { Router } from "express";
import * as authService from "./auth.service.js"
import * as authValidation from "./auth.validation.js"
import { successResponse } from "../../Common/index.js";
import { validation } from "../../Middleware/index.js";
const authRouter = Router()

authRouter.post('/signup', validation(authValidation.signupSchema), async (req, res) => {
    const message = await authService.signup(req.body)
    return successResponse({ res, message, status: 201 })
})
authRouter.patch('/confirm-email', validation(authValidation.verifyEmailSchema), async (req, res) => {
    const message = await authService.verifyEmail(req.body)
    return successResponse({ res, message })
})
authRouter.patch('/resend-otp', validation(authValidation.emailSchema), async (req, res) => {
    const message = await authService.resendOtp(req.body)
    return successResponse({ res, message })
})
authRouter.post('/login', validation(authValidation.loginSchema), async (req, res) => {
    const result = await authService.login(req.body, `${req.protocol}://${req.host}`)
    return result.is2FA ? successResponse({ res, message: result.message }) : successResponse({ res, data: result.data })
})
authRouter.post('/login/2FA', validation(authValidation.loginFor2FASchema), async (req, res) => {
    const { data, message } = await authService.loginFor2FA(req.body, `${req.protocol}://${req.host}`)
    return successResponse({ res, message, data })
})
authRouter.post('/signup/gmail', async (req, res) => {
    const message = await authService.googleSignup(req.body)
    return successResponse({ res, message })
})
authRouter.post('/login/gmail', async (req, res) => {
    const data = await authService.googleLogin(req.body, `${req.protocol}://${req.host}`)
    return successResponse({ res, data })
})
authRouter.post('/gmail', async (req, res) => {
    const { credentials, isNew } = await authService.googleSignupAndLogin(req.body, `${req.protocol}://${req.host}`)
    return successResponse({ res, data: { credentials }, status: isNew ? 201 : 200 })
})


export default authRouter