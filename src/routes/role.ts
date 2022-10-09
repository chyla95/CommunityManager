import { Router } from "express";
import * as roleController from "../controllers/role";

export const router = Router();

router.post("/", roleController.createRole);
router.get("/", roleController.getRoles);
