import { ErrorBase } from "./error-base";

export class CriticalSystemError extends ErrorBase {
  readonly isOperational = false;

  constructor(message: string = "System Error!") {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
