import HablaErrorCodes from "../error-codes";
import { HablaError } from "../habla-error";

export class AuthorizationError extends HablaError {
    constructor(message?: string) {
        super(message || 'Not allowed to access resource.', HablaErrorCodes.AUTHORIZATION_ERROR);
    }
}