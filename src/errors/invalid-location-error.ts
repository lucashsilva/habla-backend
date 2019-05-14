import HablaErrorCodes from "./error-codes";
import { HablaError } from "./habla-error";

export class InvalidLocationError extends HablaError {
    constructor(message?: string) {
        super(message || 'Invalid location information.', HablaErrorCodes.INVALID_LOCATION_ERROR);
    }
}