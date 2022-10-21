import { HttpStatusCode } from "../../utilities/http-status-codes";
import { HttpErrorBase } from "./http-error-base";

export class NotFoundError extends HttpErrorBase {
  readonly statusCode = HttpStatusCode.NOT_FOUND_404;
  readonly isOperational = true;

  constructor(message: string = "Not Found!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
