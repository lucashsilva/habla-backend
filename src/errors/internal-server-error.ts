import HablaErrorCodes from "./error-codes";
import { HablaError } from "./habla-error";

export class InternalServerError extends HablaError {
    constructor(message?: string) {
        super(message || 'InternalServerError.', HablaErrorCodes.INTERNAL_SERVER_ERROR);
    }
}