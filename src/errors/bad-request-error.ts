import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  readonly statusCode = 400;

  constructor(message: string = "Bad Request!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
