import { HttpError } from "./http-error";
import { ErrorOptions } from "../error-options";

export class NotFoundError extends HttpError {
    httpStatus = 404;
    
    constructor(options?: ErrorOptions) {
        super({ ...options, message: options && options.message || 'Resource not found.' });
    }
}