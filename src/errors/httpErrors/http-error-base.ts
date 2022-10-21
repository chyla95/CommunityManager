import { ErrorBase } from "../error-base";

export abstract class HttpErrorBase extends ErrorBase {
  abstract readonly statusCode: number;
}
