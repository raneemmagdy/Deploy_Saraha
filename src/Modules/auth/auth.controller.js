import { Router } from "express";
import * as authService from "./auth.service.js";
import * as authValidation from "./auth.validation.js";
import { successResponse } from "../../Common/index.js";
import { validation } from "../../Middleware/validation.middleware.js";
const authRouter = Router();

//==============================================signup
authRouter.post(
  "/signup",
  validation(authValidation.signup),
  async (req, res) => {
    const message = await authService.signup(req.validate.body);
    return successResponse({ res, message, status: 201 });
  },
);

//==============================================login
authRouter.post(
  "/login",
  validation(authValidation.login),
  async (req, res) => {
    const data = await authService.login(
      req.validate.body,
      `${req.protocol}://${req.host}`, //http://localhost:3000
    );
    return successResponse({ res, data });
  },
);
authRouter.post(
  "/login/2FA",
  validation(authValidation.verifyEmail),
  async (req, res) => {
    const { data, message } = await authService.loginFor2FA(
      req.body,
      `${req.protocol}://${req.host}`,
    );
    return successResponse({ res, message, data });
  },
);

authRouter.patch(
  "/confirm-email",
  validation(authValidation.verifyEmail),
  async (req, res) => {
    const message = await authService.verifyEmail(req.body);
    return successResponse({ res, message });
  },
);
authRouter.patch(
  "/resend-otp",
  validation(authValidation.email),
  async (req, res) => {
    const message = await authService.resendOtp(req.body);
    return successResponse({ res, message });
  },
);

authRouter.post("/signup/gmail", async (req, res) => {
  const message = await authService.signupWithGoogle(req.body);
  return successResponse({ res, message, status: 201 });
});

authRouter.post("/login/gmail", async (req, res) => {
  const data = await authService.loginWithGoogle(
    req.body,
    `${req.protocol}://${req.host}`, //http://localhost:3000
  );
  return successResponse({ res, data });
});
authRouter.post("/gmail", async (req, res) => {
  const { credentials, status } = await authService.loginOrSignupWithGoogle(
    req.body,
    `${req.protocol}://${req.host}`, //http://localhost:3000
  );
  return successResponse({ res, data: credentials, status });
});
export default authRouter;
