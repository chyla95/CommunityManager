export abstract class ErrorBase extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;
  readonly message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}
