import HablaErrorCodes from "./error-codes";
import { HablaError } from "./habla-error";

export class InsufficentScoreError extends HablaError {
    constructor(message?: string) {
        super(message || 'Insufficent score to accomplish resource.', HablaErrorCodes.NOT_FOUND_ERROR);
    }
}