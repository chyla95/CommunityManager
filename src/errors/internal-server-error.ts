import { CustomError } from "./custom-error";

export class InternalServerError extends CustomError {
  readonly statusCode = 500;

  constructor() {
    super("Internal Server Error!");
  }

  serializeErrors() {
    return [{ message: "Internal Server Error!" }];
  }
}
