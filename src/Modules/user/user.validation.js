import { z } from "zod";
import { generalValidationField } from "../../Common/validation.js";
import { verifyEmail } from "../auth/auth.validation.js";

export const otp = (lang) => {
  return z.object({
    body: verifyEmail(lang).shape.body.pick({ otp: true }),
  });
};
