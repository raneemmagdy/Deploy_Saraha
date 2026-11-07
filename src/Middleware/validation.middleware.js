import { BadRequestException, LanguageEnum } from "../Common/index.js";

export const validation = (Schema) => {
  return (req, res, next) => {
    const lang = Number(req.headers["accept-language"] ?? LanguageEnum.EN);
    console.log({ Schema: Schema(lang) });

    const validationResult = Schema(lang).safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
      files: req.files,
      file: req.file,
    });
    console.log({ validationResult });

    if (!validationResult.success) {
      throw BadRequestException({
        message: "validation error",
        options: {
          cause: { status: 400, errors: validationResult.error.issues },
        },
      });
    }
    req.validate = validationResult.data;
    next();
  };
};
