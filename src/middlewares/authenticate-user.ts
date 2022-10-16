import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { AccountStatus, IUser } from "../models/user";
import { NotAuthorizedError } from "../errors/not-authorized-error";

// export const authenticateUser = passport.authenticate("jwt", { session: false });
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, (error, user: IUser, info) => {
    if (error) return next(new Error(error));
    if (!user) return next(new NotAuthorizedError("Not Authorized!"));
    if (user.status == AccountStatus.Suspended) return next(new NotAuthorizedError("Account Suspended!"));

    req.user = user;
    return next();
  })(req, res, next);
};

// Extends "req.employee" with "IEmployee" properties
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
