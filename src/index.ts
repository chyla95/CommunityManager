import express from "express";
import mongoose from "mongoose";
import passport from "passport";

import { handleException } from "./middlewares/handle-exception";
import { handleInvalidRoute } from "./middlewares/handle-invalid-route";
import { router as userRouter } from "./routes/user";
import { router as roleRouter } from "./routes/role";
import { router as employeeRouter } from "./routes/employee";
import { getEnvironmentType } from "./utilities/get-environment-type";
import { CriticalSystemError } from "./errors/critical-system-error";
import { setupConsole } from "./utilities/setup-console";
import { setupCors } from "./middlewares/setup-cors";

const app = express();

passport.initialize();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(setupCors);

app.use("/api/user", userRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/role", roleRouter);
app.use(handleInvalidRoute);
app.use(handleException);

setupConsole();

const startApp = async () => {
  if (!process.env.DATABASE_URL) {
    throw new CriticalSystemError("DATABASE_URL is not defined!");
  }

  if (!process.env.JWT_RSA_PRIVATE_KEY) {
    throw new CriticalSystemError("JWT_RSA_PRIVATE_KEY is not defined!");
  }

  if (!process.env.JWT_RSA_PUBLIC_KEY) {
    throw new CriticalSystemError("JWT_RSA_PUBLIC_KEY is not defined!");
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.info("Connected: MongoDB");
  } catch (error) {
    throw new CriticalSystemError("Could Not Connect To The Database!");
  }

  const appPort = process.env.PORT || 3000;
  const appEnvironment = getEnvironmentType(app);
  app.listen(appPort, () => {
    console.info(`The App is Running
    -> Port: ${appPort}
    -> Environment: ${appEnvironment}`);
  });
};
startApp();
