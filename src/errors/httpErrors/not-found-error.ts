import { HttpErrorBase } from "./http-error-base";

export class NotFoundError extends HttpErrorBase {
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(message: string = "Not Found!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
