import { Router } from "express";
import * as userController from "../controllers/user";
import { authenticate } from "../middlewares/authenticate";

export const router = Router();

router.post("/signUp", userController.signUpUser);
router.post("/signIn", userController.signInUser);
router.get("/getCurrentUser", authenticate, userController.getCurrentUser);

//express-validator
