import { Router } from "express";
import * as roleController from "../controllers/role";

export const router = Router();

// Roles To Users
router.post("/user", roleController.assignRole);
router.delete("/user", roleController.retractRole);

// Roles
router.post("/", roleController.createRole);
router.get("/", roleController.getRoles);
router.get("/:roleId", roleController.getRole);
router.put("/:roleId", roleController.updateRole);
router.delete("/:roleId", roleController.deleteRole);
