import { Router } from "express";
import * as roleController from "../controllers/role";

export const router = Router();

// Roles To Employee
router.post("/employee", roleController.assignRole);
router.delete("/employee", roleController.retractRole);

// Roles
router.post("/", roleController.createRole);
router.get("/", roleController.getRoles);
router.get("/:roleId", roleController.getRole);
router.put("/:roleId", roleController.updateRole);
router.delete("/:roleId", roleController.deleteRole);
