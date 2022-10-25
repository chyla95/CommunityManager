import mongoose from "mongoose";
import passport from "passport";
import { app } from "./setup-app";
import { setupConsole } from "./utilities/setup-console";
import { getEnvironmentType } from "./utilities/get-environment-type";
import { CriticalSystemError } from "./errors/critical-system-error";

setupConsole();
// passport.initialize();

const startApp = async () => {
  if (!process.env.DATABASE_URL) throw new CriticalSystemError("DATABASE_URL is not defined!");
  if (!process.env.JWT_RSA_PRIVATE_KEY) throw new CriticalSystemError("JWT_RSA_PRIVATE_KEY is not defined!");
  if (!process.env.JWT_RSA_PUBLIC_KEY) throw new CriticalSystemError("JWT_RSA_PUBLIC_KEY is not defined!");

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
