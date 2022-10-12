import { Request, Response, NextFunction } from "express";
import { NotAuthorizedError } from "../errors/not-authorized-error";
import { Permissions } from "../models/role";

export const authorizeUser = (permissions: Permissions[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new NotAuthorizedError("No User is Signed In."));
    }

    for (const permission of permissions) {
      const hasPermission = req.user.hasPermission(permission);
      const hasFullSystemAccess = req.user.hasFullSystemAccess();

      if (!hasFullSystemAccess && !hasPermission) {
        return next(new NotAuthorizedError("You Are Missing Permissions."));
      }
    }

    return next();
  };
};
