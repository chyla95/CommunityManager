// import { ValidationError } from "express-validator";
// import { CustomError } from "./custom-error";

// export class RequestValidationError extends CustomError {
//   readonly statusCode = 400;
//   readonly errors;

//   constructor(errors: ValidationError[]) {
//     super("Invalid Parameters!");
//     this.errors = errors;
//   }

//   serializeErrors() {
//     return this.errors.map((err) => {
//       return { message: err.msg, field: err.param };
//     });
//   }
// }
