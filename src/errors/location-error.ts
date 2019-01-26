import HablaErrorCodes from "./error-codes";
import { HablaError } from "./habla-error";

export class LocationError extends HablaError {
    constructor(message?: string) {
        super(message || 'Invalid location information.', HablaErrorCodes.MISSING_LOCATION_ERROR);
    }
}