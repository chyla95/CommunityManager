import { HttpStatusCode } from "../../utilities/http-status-codes";
import { HttpErrorBase } from "./http-error-base";

export class InternalServerError extends HttpErrorBase {
  readonly statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR_500;
  readonly isOperational = true;

  constructor(message: string = "Internal Server Error!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
