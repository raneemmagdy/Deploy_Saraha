import { z } from "zod";
import mongoose from "mongoose";
import { GenderEnum, LanguageEnum } from "./enum/index.js";

const matchField = ({ original, copy, data, ctx, lang }) => {
  if (data[original] != data[copy]) {
    ctx.addIssue({
      code: "custom",
      path: [copy],
      message:
        lang == LanguageEnum.AR
          ? `فشل المطابقة بين ${original} و ${copy}`
          : `fail to match between ${original} and ${copy}`,
    });
  }
};

export const generalValidationField = {
  email: (lang) =>
    z.email({
      message:
        "invalid email format please add valid email like example@example.com",
    }),
  otp: (lang) =>
    z.string().regex(/^\d{6}$/, { message: "OTP must be a 6-digit number" }),
  password: (lang) =>
    z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#_$%^&*()])[A-Za-z\d!@#_$%^&*()]{8,16}$/,
        {
          message:
            "Password must be 8-16 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
      )
      .min(8)
      .max(16),

  firstName: (lang) =>
    z
      .string()
      .min(2, {
        message:
          lang == LanguageEnum.AR
            ? "الاسم الأول يجب أن يكون بطول حرفين على الأقل"
            : "First name must be at least 2 characters long",
      })
      .max(25, {
        message:
          lang == LanguageEnum.AR
            ? "الاسم الأول يجب ألا يزيد عن 25 حرفًا"
            : "First name must be at most 25 characters long",
      }),

  lastName: (lang) =>
    z
      .string()
      .min(2, {
        message:
          lang == LanguageEnum.AR
            ? "اسم العائلة يجب أن يكون بطول حرفين على الأقل"
            : "Last name must be at least 2 characters long",
      })
      .max(25, {
        message:
          lang == LanguageEnum.AR
            ? "اسم العائلة يجب ألا يزيد عن 25 حرفًا"
            : "Last name must be at most 25 characters long",
      }),
  phone: (lang) => z.e164(),
 gender: (lang) =>
  z.enum(GenderEnum, {
    message:
      lang == LanguageEnum.AR
        ? "النوع يجب أن يكون ذكر أو أنثى"
        : "Gender must be male or female",
  }),
  id: (lang) =>
    z.string().refine(
      (data) => {
        return mongoose.Types.ObjectId.isValid(data);
      },
      { message: "Invalid format" },
    ),
  file: (lang) =>
    z.strictObject({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.string(),
      buffer: z.instanceof(Buffer),
      size: z.number(),
      finalPath: z.string(),
    }),
  matchField,
};
