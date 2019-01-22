import HablaErrorCodes from "../error-codes";
import { HablaError } from "../habla-error";

export class NotFoundError extends HablaError {
    constructor(message?: string) {
        super(message || 'Resource not found.', HablaErrorCodes.NOT_FOUND_ERROR);
    }
}