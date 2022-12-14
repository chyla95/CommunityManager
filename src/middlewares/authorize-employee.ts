import { Request, Response, NextFunction } from "express";
import { Employee, IEmployee } from "../models/employee";
import { NotAuthorizedError } from "../errors/httpErrors/not-authorized-error";
import { NotFoundError } from "../errors/httpErrors/not-found-error";
import { Permissions } from "../models/role";

export const authorizeEmployee = (permissions: Permissions[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new NotAuthorizedError("You Have To Be Signed In To Perform This Action!"));
    }

    const employee = await Employee.findOne({ user: user.id }).populate("user").populate("roles");
    if (!employee) {
      return next(new NotFoundError("You Have To Be an Employee To Perform This Action!"));
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
