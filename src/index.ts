import express from "express";
import mongoose from "mongoose";
import passport from "passport";

import { handleException } from "./middlewares/handle-exception";
import { validateRoute } from "./middlewares/validate-route";
import { router as userRouter } from "./routes/user";

const app = express();

passport.initialize();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(userRouter);
app.use("/api/user", userRouter);
app.use(validateRoute);
app.use(handleException);

const startApp = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined!");
  }

  if (!process.env.JWT_RSA_PRIVATE_KEY) {
    throw new Error("JWT_RSA_PRIVATE_KEY is not defined!");
  }

  if (!process.env.JWT_RSA_PUBLIC_KEY) {
    throw new Error("JWT_RSA_PUBLIC_KEY is not defined!");
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.info("Connected: MongoDB");
  } catch (error) {
    console.error(error);
  }

  const appPort = process.env.PORT || 3000;
  app.listen(appPort, () => {
    console.info(`App port: ${appPort}`);
  });
};
startApp();
