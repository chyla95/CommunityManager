import { HttpStatusCode } from "../../utilities/http-status-codes";
import { HttpErrorBase } from "./http-error-base";

export class NotAuthorizedError extends HttpErrorBase {
  readonly statusCode = HttpStatusCode.UNAUTHORIZED_401;
  readonly isOperational = true;

  constructor(message: string = "Not Authorized!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
