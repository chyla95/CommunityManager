import { ErrorBase } from "./error-base";

export class SystemError extends ErrorBase {
  readonly isOperational = true;

  constructor(message: string = "System Error!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
