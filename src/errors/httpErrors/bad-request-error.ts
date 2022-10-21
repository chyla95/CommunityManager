import { HttpErrorBase } from "./http-error-base";

export class BadRequestError extends HttpErrorBase {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(message: string = "Bad Request!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
