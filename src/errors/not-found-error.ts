import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  readonly statusCode = 404;

  constructor() {
    super("Not Found!");
  }

  serializeErrors() {
    return [{ message: "Not Found!" }];
  }
}
