import { LocationError } from "../errors/http/location-error";
import { AuthenticationError } from "../errors/http/authentication-error";

export const requireLocationInfo = (context) => {
    if (!(context.location && context.location.latitude && context.location.longitude)) throw new LocationError();

    try {
        const { latitude, longitude } = context.location;

        parseInt(latitude);
        parseInt(longitude);
    } catch (error) {
        throw new LocationError("Invalid location.");
    }
}