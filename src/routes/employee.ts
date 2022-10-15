import { Router } from "express";
import * as employeeController from "../controllers/employee";

export const router = Router();

// Employee (manageOwn)
router.get("/current", employeeController.getCurrentEmployee);

// Employees (manageAll)
router.post("/:userId", employeeController.createEmployee);
router.get("/", employeeController.getEmployees);
router.get("/:employeeId", employeeController.getEmployee);
router.put("/:employeeId", employeeController.updateEmployee);
router.delete("/:employeeId", employeeController.deleteEmployee);

// Promote To Employee

// Edit Profile
// Change Email
// Change Password

// Finish Employee routes and body validation
// Add BASIC customer Logic, just for testing purposes
// Cleaning: Errors, comments, routes, unification, naming, config files, db conn strings, etc.
// Unit Tests
// (Optional) Make Github Actions Testing Pipeline
