import { HttpStatusCode } from "../../utilities/http-status-codes";
import { HttpErrorBase } from "./http-error-base";

export class BadRequestError extends HttpErrorBase {
  readonly statusCode = HttpStatusCode.BAD_REQUEST_400;
  readonly isOperational = true;

  constructor(message: string = "Bad Request!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
