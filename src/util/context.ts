import { InvalidLocationError } from "../errors/invalid-location-error";
import { MissingLocationError } from "../errors/missing-location-error";

export const requireLocationInfo = (context) => {
    if (!(context.location && context.location.latitude && context.location.longitude)) throw new MissingLocationError();

    try {
        const { latitude, longitude } = context.location;

        if ((parseFloat(latitude) > 90 || parseFloat(latitude) < -90) ||
            parseFloat(longitude) > 180 || parseFloat(longitude) < -180) {
            throw new InvalidLocationError("Invalid location.");
        }
    } catch (error) {
        throw new InvalidLocationError("Invalid location.");
    }
}