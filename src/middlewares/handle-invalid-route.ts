import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../errors/httpErrors/not-found-error";

export const handleInvalidRoute = (req: Request, res: Response, next: NextFunction) => {
  return next(new NotFoundError());
};
