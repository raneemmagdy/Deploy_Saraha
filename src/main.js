import express from "express";
import { NotFoundException, successResponse } from "./Common/index.js";
import { PORT, USER_ACCESS_JWT_SECRET } from "./config.js";
import { globaLErrorHandler } from "./Middleware/index.js";
import { checkConnectionDB } from "./DB/connection.db.js";
import { authRouter, userRouter } from "./Modules/index.js";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import cors from "cors";
import { resolve } from "path";
const app = express();
//===========================middleware===========================
app.use(
  express.json(),
  cors({
    origin: "http://localhost:3000",
  }),
);
app.use("/assets", express.static(resolve("assets")));

app.get("/", (req, res) => {
  successResponse({ res , message: "hello from server" });
});
//===========================db===========================
await checkConnectionDB();
//===========================routes===========================
app.use("/auth", authRouter);
app.use("/user", userRouter);

//==================================test================================
// const SECRET_KEY = "sdfghjkjhgtrewsqdfhjiklkjhd";
// const token = jwt.sign({ sub: "6acd02bac99fc10d23a38d02" }, SECRET_KEY, {
//   notBefore: 20,
// });
// console.log({ token });

// const decode = jwt.decode(token);
// console.log({ decode });

// const verify = jwt.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YWNkMDJiYWM5OWZjMTBkMjNhMzhkMDIiLCJpYXQiOjE3OTE5MTA3MTUsImV4cCI6MTc5MTkxMjUxNSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwIn0.qZdn8ttTmIqUJ5L1Zo9WdcVMJk758eWX4BLogasmNGw", USER_ACCESS_JWT_SECRET, { ignoreNotBefore: true });
// console.log({ verify });
//===========================Page not found===========================

app.all("{/*dummy}", (req, res) => {
  return NotFoundException({ message: "Page not found" });
});

//===========================error handler===========================
app.use(globaLErrorHandler);
//===========================server===========================
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
