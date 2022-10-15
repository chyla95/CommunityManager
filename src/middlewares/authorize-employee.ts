import { Request, Response, NextFunction } from "express";
import { Employee, IEmployee } from "../models/employee";
import { NotAuthorizedError } from "../errors/not-authorized-error";
import { NotFoundError } from "../errors/not-found-error";
import { Permissions } from "../models/role";

export const authorizeEmployee = (permissions: Permissions[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new NotAuthorizedError("You Are Not Signed In!"));
    }

    const employee = await Employee.findOne({ _id: user.id }).populate("user").populate("roles");
    if (!employee) {
      return next(new NotFoundError("You Are Not an Employee!"));
    }

    const hasFullSystemAccess = employee.hasFullSystemAccess();
    if (hasFullSystemAccess) {
      req.employee = employee;
      return next();
    }

    const missingPermissions: string[] = [];
    for (const permission of permissions) {
      const hasPermission = employee.hasPermission(permission);
      if (!hasPermission) missingPermissions.push(permission);
    }

    if (missingPermissions.length > 0) {
      return next(new NotAuthorizedError("You Are Missing Following Permissions: " + missingPermissions + "!"));
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
