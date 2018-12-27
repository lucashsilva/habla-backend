import { HttpError } from "./http-error";
import { ErrorOptions } from "../error-options";

export class AuthorizationError extends HttpError {
    httpStatus = 403;

    constructor(options?: ErrorOptions) {
        super({ ...options, message: options && options.message || 'Not allowed to access resource.' });
    }
}