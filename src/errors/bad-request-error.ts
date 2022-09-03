import { ErrorBase } from "./error-base";

export class BadRequestError extends ErrorBase {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(message: string = "Bad Request!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
