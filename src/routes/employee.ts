import { Router } from "express";
import * as employeeController from "../controllers/employee";

export const router = Router();

// Employees (manageAll)
router.get("/", employeeController.getEmployees);
router.get("/:employeeId", employeeController.getEmployee);
router.put("/:employeeId", employeeController.updateEmployee);
router.delete("/:employeeId", employeeController.deleteEmployee);

// TODO: Promote To Employee
router.post("/:userId", employeeController.promoteUserToEmployee);

// Employee (manageOwn)
// Edit Profile
// Change Email
// Change Password

// change Staff to Employee (Naming)
// Finish Employee routes and body validation
// Add BASIC customer Logic, just for testing purposes
// Cleaning: Errors, comments, routes, unification, naming, config files, db conn strings, etc.
// Unit Tests
// (Optional) Make Github Actions Testing Pipeline
