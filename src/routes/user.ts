import { Router } from "express";
import * as userController from "../controllers/user";

export const router = Router();

// Users (manageAll)
router.get("/", userController.getUsers);
router.get("/:userId", userController.getUser);
router.put("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);

// Users (manageOwn)

// Auth
router.post("/auth/signUp", userController.signUpUser);
router.post("/auth/signIn", userController.signInUser);
router.get("/auth/currentUser", userController.getCurrentUser);
