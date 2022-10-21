import { Request, Response, NextFunction } from "express";
import { HttpErrorBase } from "../errors/httpErrors/http-error-base";
import { HttpStatusCode } from "../utilities/http-status-codes";

export const handleException = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof HttpErrorBase) {
    if (!error.isOperational) {
      return process.exit(1);
    }
    return res.status(error.statusCode).send({ errors: error.serializeErrors() });
  }
  return res.status(HttpStatusCode.BAD_REQUEST_400).send({ errors: [{ message: "Something went wrong!" }] });
};
