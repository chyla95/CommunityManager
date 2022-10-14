import { Request, Response, NextFunction } from "express";
import { Employee, IEmployee } from "../models/employee";
import { NotAuthorizedError } from "../errors/not-authorized-error";
import { NotFoundError } from "../errors/not-found-error";
import { Permissions } from "../models/role";

export const authorizeEmployee = (permissions: Permissions[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new NotAuthorizedError("You Are Not Signed In!"));
    }

    const employee = await Employee.findOne({ _id: req.user.id }).populate("roles");
    if (!employee) {
      return next(new NotFoundError("You Are Not an Employee!"));
    }

    for (const permission of permissions) {
      const hasPermission = employee.hasPermission(permission);
      const hasFullSystemAccess = employee.hasFullSystemAccess();

      if (!hasFullSystemAccess && !hasPermission) {
        return next(new NotAuthorizedError("You Are Missing Permissions!"));
      }
    }

    req.employee = employee;
    return next();
  };
};

// Extends "req.employee" with "IEmployee" properties
declare global {
  namespace Express {
    interface Request {
      employee?: IEmployee;
    }
  }
}
