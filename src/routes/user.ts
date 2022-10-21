import { Router } from "express";
import * as userController from "../controllers/user";

export const router = Router();

// Auth (manageOwn)
router.post("/auth/signUp", userController.signUpUser);
router.post("/auth/signIn", userController.signInUser);
