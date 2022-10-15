import { Router } from "express";
import * as userController from "../controllers/user";

export const router = Router();

// Auth
router.post("/auth/signUp", userController.signUpUser);
router.post("/auth/signIn", userController.signInUser);
