import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  readonly statusCode = 400;

  constructor() {
    super("Bad Request!");
  }

  serializeErrors() {
    return [{ message: "Bad Request!" }];
  }
}
