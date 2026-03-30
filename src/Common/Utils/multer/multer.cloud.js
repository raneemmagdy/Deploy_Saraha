import multer from "multer";
import { fileFilter } from "./multer.validation.js";
export const cloudFileUpload = ({
    validation = [],
    size = 5
}) => {
    const storage = multer.diskStorage({
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
    return multer({ fileFilter: fileFilter(validation), storage: storage, limits: { fileSize: size * 1024 * 1024 } })
}