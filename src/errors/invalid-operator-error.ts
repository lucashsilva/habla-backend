import HablaErrorCodes from "./error-codes";
import { HablaError } from "./habla-error";

export class InvalidOperationError extends HablaError {
    constructor(message?: string) {
        super(message || 'Invalid operation for this user.', HablaErrorCodes.INVALID_OPERATION_ERROR);
    }
}