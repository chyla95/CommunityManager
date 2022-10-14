import { Request, Response, NextFunction } from "express";
import { Staff, IStaff } from "../models/staff";
import { NotAuthorizedError } from "../errors/not-authorized-error";
import { NotFoundError } from "../errors/not-found-error";
import { Permissions } from "../models/role";

export const authorizeStaff = (permissions: Permissions[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new NotAuthorizedError("You Are Not Signed In!"));
    }

    const staff = await Staff.findOne({ _id: req.user.id }).populate("roles");
    if (!staff) {
      return next(new NotFoundError("You Are Not a Staff Member!"));
    }

    for (const permission of permissions) {
      const hasPermission = staff.hasPermission(permission);
      const hasFullSystemAccess = staff.hasFullSystemAccess();

      if (!hasFullSystemAccess && !hasPermission) {
        return next(new NotAuthorizedError("You Are Missing Permissions!"));
      }
    }

    req.staff = staff;

    return next();
  };
};

// Extends "req.staff" with "IStaff" properties
declare global {
  namespace Express {
    interface Request {
      staff?: IStaff;
    }
  }
}
