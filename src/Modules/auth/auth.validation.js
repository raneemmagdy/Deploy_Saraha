import { z } from "zod";
import { generalValidationField } from "../../Common/validation.js";

export const loginSchema = (lang) => {
  return z.strictObject({
    email: generalValidationField.email(lang),
    password: generalValidationField.password(lang),
  });
};

export const login = (lang) => {
  return z.object({
    body: loginSchema(lang),
  });
};

export const signup = (lang) => {
  return z.object({
    body: loginSchema(lang)
      .safeExtend({
        firstName: generalValidationField.firstName(lang),
        lastName: generalValidationField.lastName(lang),
        phone: generalValidationField.phone(lang),
        confirmPassword: generalValidationField.password(lang),
        gender: generalValidationField.gender(lang),
      })
      .superRefine((data, ctx) => {
        generalValidationField.matchField({
          original: "password",
          copy: "confirmPassword",
          data,
          ctx,
          lang,
        });
      }),
  });
};
export const email = (lang) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationField.email(lang),
    }),
  });
};

export const verifyEmail = (lang) => {
  return z.object({
    body: email(lang).shape.body.extend({
      otp: generalValidationField.otp(lang),
    }),
  });
};
