import multer from "multer";
import { resolve } from "node:path"
import { randomUUID } from "node:crypto"
import { existsSync, mkdirSync } from "node:fs";
import { fileFilter } from "./multer.validation.js";
export const localFileUpload = ({
    cutomPath = "general",
    validation=[],
    size =  5

}) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const fullPath = resolve(`./uploads/${cutomPath}`)
            if (!existsSync(fullPath)) {
                mkdirSync(fullPath, { recursive: true })
            }
            cb(null, fullPath)
        },
        filename: function (req, file, cb) {
            const uniqueFileName = randomUUID() + '-' + file.originalname
            file.finalPath = `uploads/${cutomPath}/${uniqueFileName}`
            cb(null, uniqueFileName)
        }
    })
    return multer({fileFilter: fileFilter(validation), storage: storage, limits: { fileSize: size * 1024 * 1024 } })
}