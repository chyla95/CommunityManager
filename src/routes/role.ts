import { Router } from "express";
import * as roleController from "../controllers/role";

export const router = Router();

// Assign / Retract Roles (manageAll)
router.post("/assign", roleController.assignRole);
router.delete("/retract", roleController.retractRole);

// Roles (manageAll)
router.post("/", roleController.createRole);
router.get("/", roleController.getRoles);
router.get("/:roleId", roleController.getRole);
router.put("/:roleId", roleController.updateRole);
router.delete("/:roleId", roleController.deleteRole);
