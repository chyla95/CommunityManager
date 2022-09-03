import { ErrorBase } from "./error-base";

export class NotAuthorizedError extends ErrorBase {
  readonly statusCode = 401;
  readonly isOperational = true;

  constructor(message: string = "Not Authorized!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
