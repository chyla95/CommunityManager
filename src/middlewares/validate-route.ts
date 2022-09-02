import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../errors/not-found-error";

export const validateRoute = (req: Request, res: Response, next: NextFunction) => {
  return next(new NotFoundError());
};
