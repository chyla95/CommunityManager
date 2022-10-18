import { Router } from "express";
import * as employeeController from "../controllers/employee";

export const router = Router();

// Employee (manageOwn)
router.post("/current", employeeController.applyAsEmployee);
router.get("/current", employeeController.getCurrentEmployee);
router.put("/current", employeeController.updateCurrentEmployee);
router.delete("/current", employeeController.deleteCurrentEmployee);

// Employees (manageAll)
router.get("/", employeeController.getEmployees);
router.get("/:userId", employeeController.getEmployee);
router.put("/:userId", employeeController.updateEmployee);
router.delete("/:userId", employeeController.deleteEmployee);
