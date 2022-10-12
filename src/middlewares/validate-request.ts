import { Router, Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-error";

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new RequestValidationError(errors.array()));
  }

  next();
};

export const validateRequest = (rules: ValidationChain[]) => {
  return Router({ mergeParams: true }).use(...rules, handleValidationErrors);
};
