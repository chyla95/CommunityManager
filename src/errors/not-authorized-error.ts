import { CustomError } from "./custom-error";

export class NotAuthorizedError extends CustomError {
  readonly statusCode = 401;

  constructor(message: string = "Not Authorized!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
