import { Request, Response, NextFunction } from "express";
import { ErrorBase } from "../errors/error-base";

export const handleException = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ErrorBase) {
    if (!error.isOperational) {
      return process.exit(1);
    }
    return res.status(error.statusCode).send({ errors: error.serializeErrors() });
  }
  return res.status(400).send({ errors: [{ message: "Something went wrong!" }] });
};
