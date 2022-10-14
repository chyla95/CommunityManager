import { Router } from "express";
import * as staffController from "../controllers/staff";

export const router = Router();

// Users (manageAll)
router.get("/", staffController.getUsers);
router.get("/:staffId", staffController.getUser);
router.put("/:staffId", staffController.updateUser);
router.delete("/:staffId", staffController.deleteUser);

// TODO: Promote To Staff
router.post("/:userId", staffController.promoteUserToStaff);

// Users (manageOwn)
// Edit Profile
// Change Email
// Change Password

// change Staff to Employee
