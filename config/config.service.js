import { config } from "dotenv";
import { resolve } from "path";
const NODE_ENV = process.env.NODE_ENV;
const path = NODE_ENV === "production" ? resolve('config/.env.production') : resolve('config/.env.development');
config({ path });
//==================================PORT=====================================
export const PORT = process.env.PORT ?? 5000;
//==================================DB_MONGODB=====================================
export const MONGODB_URI = process.env.MONGODB_URI;
//==================================DB_REDIS=====================================
export const REDIS_URI = process.env.REDIS_URI;
//==================================SALT_ROUND=====================================
export const SALT_ROUND = + process.env.SALT_ROUND;
//==================================ENCRYPTION_KEY=====================================
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

//==================================JWT expires in=====================================
export const REFRESH_EXPIRES_IN = +process.env.REFRESH_EXPIRES_IN;
export const ACCESS_EXPIRES_IN = +process.env.ACCESS_EXPIRES_IN;
//==================================JWT secret System=====================================
export const SYSTEM_ACCESS_JWT_SECRET = process.env.SYSTEM_ACCESS_JWT_SECRET;
export const SYSTEM_REFRESH_JWT_SECRET = process.env.SYSTEM_REFRESH_JWT_SECRET;
//==================================JWT secret User=====================================
export const USER_ACCESS_JWT_SECRET = process.env.USER_ACCESS_JWT_SECRET;
export const USER_REFRESH_JWT_SECRET = process.env.USER_REFRESH_JWT_SECRET;
//==================================CLIENT ID=====================================
export const CLIENT_ID = process.env.CLIENT_ID;
//==================================Cloudinary=====================================
export const CLOUD_NAME = process.env.CLOUD_NAME;
export const API_KEY = process.env.API_KEY;
export const API_SECRET = process.env.API_SECRET;
//==================================Application_name=====================================
export const APPLICATION_NAME = process.env.APPLICATION_NAME;
//==================================Send Email Info=====================================
export const EMAIL_APP = process.env.EMAIL_APP;
export const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;