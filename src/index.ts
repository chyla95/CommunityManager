import express from "express";
import mongoose from "mongoose";

import { User } from "./models/user";

const app = express();

app.get("/", async (req, res) => {
  await User.create({ email: "test@test.com", password: "kk" });
  const userCount = await User.countDocuments({});
  console.info("Users: " + userCount);
  await User.deleteMany({});

  res.send("Empty!");
});

const startApp = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined!");
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.info("MongoDB Connected!");
  } catch (error) {
    console.error(error);
  }

  app.listen(3000, async () => {
    console.info("Listening on port 3000!");
  });
};

startApp();
