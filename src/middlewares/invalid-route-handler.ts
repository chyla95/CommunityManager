import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../errors/not-found-error";

export const invalidRouteHandler = (req: Request, res: Response, next: NextFunction) => {
  return next(new NotFoundError());
};
