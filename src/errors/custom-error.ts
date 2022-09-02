export abstract class CustomError extends Error {
  abstract readonly statusCode: number;
  readonly message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}
