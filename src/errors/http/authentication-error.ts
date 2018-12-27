import { HttpError } from "./http-error";
import { ErrorOptions } from "../error-options";

export class AuthenticationError extends HttpError {
    httpStatus = 401;

    constructor(options?: ErrorOptions) {
        super({ ...options, message: options && options.message || 'Resource requires authentication to be accessed.' });
    }
}