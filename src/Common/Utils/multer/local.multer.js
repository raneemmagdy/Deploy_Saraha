import multer from "multer";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { fileTypeFromBuffer, fileTypeFromFile } from "file-type";
import { BadRequestException } from "../../Exceptions/index.js";
import { uploadFile } from "../../Service/cloudinary.service.js";

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif"],
  file: ["application/pdf", "application/json"],
};

export const localFileUpload = ({ maxFileSize = 5 } = {}) => {
  const storage = multer.memoryStorage();
  return multer({ storage, limits: { fileSize: maxFileSize * 1024 * 1024 } }); //5mb default
};
export const validateFile = async (file, validation, cloud) => {
  const result = cloud
    ? await fileTypeFromFile(file.path)
    : await fileTypeFromBuffer(file.buffer);
  if (!result || !validation.includes(result.mime)) {
    throw BadRequestException({ message: "invalid file type" });
  }
  return result;
};
export const processFile = async ({
  customPath = "general",
  file,
  validation = [],
  cloud = false,
}) => {
  const result = await validateFile(file, validation, cloud);
  if (cloud) {
    const uploadedResult = await uploadFile({
      filePath: file.path,
      folder: customPath,
    });
    console.log({ uploadedResult });
    file.secure_url = uploadedResult.secure_url;
    file.public_id = uploadedResult.public_id;
  } else {
    await mkdir(resolve(`./assets/${customPath}`), { recursive: true });
    const uniqueFilePath = `./assets/${customPath}/${randomUUID()}.${result.ext}`;
    await writeFile(resolve(`./${uniqueFilePath}`), file.buffer);
    file.finalPath = uniqueFilePath;
  }
  return file;
};

export const processFiles = async ({
  customPath,
  files = [],
  validation = [],
  cloud = false,
}) => {
  const checkIsValidFile = await Promise.all(
    files.map((file) => validateFile(file, validation, cloud)),
  );
  console.log({ checkIsValidFile });

  const assets = [];
  for (const file of files) {
    const uploadFile = await processFile({
      customPath,
      file,
      validation,
      cloud,
    });
    assets.push(uploadFile);
  }
  return assets;
};

export const processFields = async ({
  customPath,
  fields = {},
  validation = [],
  cloud = false,
}) => {
  const allFiels = Object.values(fields).flat();
  console.log({ allFiels });

  const assests = await processFiles({
    customPath,
    files: allFiels,
    validation,
    cloud,
  });
  return assests
  // const assets = [];
  // for (const field of Object.keys(fields)) {
  //   const files = await processFiles({
  //     customPath,
  //     files: fields[field],
  //     validation,
  //     cloud,
  //   });
  //   assets.push({ field, files });
  // }
  // return assets;
};

export const processMulterUpload = async ({
  req,
  customPath = "general",
  validation = [],
  cloud,
}) => {
  if (req.file) {
    await processFile({ customPath, file: req.file, validation, cloud });
  } else if (Array.isArray(req.files)) {
    await processFiles({ customPath, files: req.files, validation, cloud });
  } else if (typeof req.files === "object" && Object.keys(req.files)?.length) {
    await processFields({ customPath, fields: req.files, validation, cloud });
  }
};
