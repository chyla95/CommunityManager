import { Router } from "express";
import * as userController from "../controllers/user";

export const router = Router();

router.post("/signUp", userController.signUpUser);
router.post("/signIn", userController.signInUser);
router.get("/getCurrentUser", userController.getCurrentUser);
