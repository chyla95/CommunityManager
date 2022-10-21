import { ValidationError } from "express-validator";
import { HttpErrorBase } from "./http-error-base";

export class RequestValidationError extends HttpErrorBase {
  readonly statusCode = 400;
  readonly isOperational = true;
  readonly errors;

  constructor(errors: ValidationError[], message: string = "Invalid Parameters!") {
    super(message);
    this.errors = errors;
  }

  serializeErrors() {
    return this.errors.map((error) => {
      return { message: error.msg, field: error.param };
    });
  }
}
