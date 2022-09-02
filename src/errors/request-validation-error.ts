import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
  readonly statusCode = 400;
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
