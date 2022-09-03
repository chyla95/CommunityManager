import { ErrorBase } from "./error-base";

export class NotFoundError extends ErrorBase {
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(message: string = "Not Found!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
