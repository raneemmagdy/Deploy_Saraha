import crypto from "node:crypto"; //1byte=8bit
import { ENCRYPTION_KEY } from "../../../config.js";
const IV_LENGTH = 16;
export const encrypt = (text) => {
  //aes-256-cbc
  //1234567891234567 56344555
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipherObj = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let ciprherText = cipherObj.update(text, "utf-8", "hex");
  ciprherText += cipherObj.final("hex");
  return `${iv.toString("hex")}:${ciprherText}`;
};
export const decrypt = (ivAndCipherText) => {
  const [iv, cipherText] = ivAndCipherText.split(":");

  const deCipherObj = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY,
    Buffer.from(iv, "hex"),
  );
  let plainText = deCipherObj.update(cipherText, "hex", "utf-8");
  plainText += deCipherObj.final("utf-8");
  return plainText;
};
