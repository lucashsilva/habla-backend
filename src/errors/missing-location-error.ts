import HablaErrorCodes from "./error-codes";
import { HablaError } from "./habla-error";

export class MissingLocationError extends HablaError {
    constructor(message?: string) {
        super(message || 'Missing location information.', HablaErrorCodes.MISSING_LOCATION_ERROR);
    }
}