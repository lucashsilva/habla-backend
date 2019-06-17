import { HablaError } from "../errors/habla-error";
import HablaErrorCodes from "../errors/error-codes";

export const requireLocationInfo = (context) => {
    if (!(context.location && context.location.latitude && context.location.longitude)) throw new HablaError("Missing location information.", HablaErrorCodes.MISSING_LOCATION_ERROR);

    try {
        const { latitude, longitude } = context.location;

        if ((parseFloat(latitude) > 90 || parseFloat(latitude) < -90) ||
            parseFloat(longitude) > 180 || parseFloat(longitude) < -180) {
            throw new HablaError("Invalid location.", HablaErrorCodes.INVALID_LOCATION_ERROR);
        }
    } catch (error) {
        throw new HablaError("Invalid location.", HablaErrorCodes.INVALID_LOCATION_ERROR);
    }
}