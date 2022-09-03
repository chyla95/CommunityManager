import { ErrorBase } from "./error-base";

export class InternalServerError extends ErrorBase {
  readonly statusCode = 500;
  readonly isOperational = true;

  constructor(message: string = "Internal Server Error!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
