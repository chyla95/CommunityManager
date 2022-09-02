import { CustomError } from "./custom-error";

export class InternalServerError extends CustomError {
  readonly statusCode = 500;

  constructor(message: string = "Internal Server Error!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
