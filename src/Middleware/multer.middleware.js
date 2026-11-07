import { BadRequestException, processMulterUpload } from "../Common/index.js";

export const uploadMiddleware = ({
  isRequired = true,
  multerMiddleware,
  customPath = "general",
  validation = [],
  cloud = false,
}) => {
  return (req, res, next) => {
    multerMiddleware(req, res, async (error) => {
      console.log({ error });

      if (error) {
        next(new Error(error.message, { cause: { status: 400 } }));
        return;
      }

      const folder =
        typeof customPath === "function" ? customPath(req) : customPath;
      try {
        if (
          isRequired &&
          !req.file &&
          !(Array.isArray(req.files) && req.files.length) &&
          !(typeof req.files == "object" && Object.keys(req.files)?.length)
        ) {
          next(BadRequestException({ message: "file is required" }));
          return;
        }
        await processMulterUpload({ customPath:folder, validation, req, cloud });
        next();
      } catch (error) {
        next(new Error(error.message, { cause: { status: 400 } }));
      }
    });
  };
};
