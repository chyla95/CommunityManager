import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  readonly statusCode = 404;

  constructor(message: string = "Not Found!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
