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
router.get("/:employeeId", employeeController.getEmployee);
router.put("/:employeeId", employeeController.updateEmployee);
router.delete("/:employeeId", employeeController.deleteEmployee);
