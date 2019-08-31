
import * as geo from "geolib";

interface Location {
    latitude: number;
    longitude: number;
}

export const getMaskedDistance = (a: Location, b: Location) => {
    const distance = geo.getDistanceSimple(a, b);
    
    if (distance < 500) {
        return "here";
    } else if (distance < 1000) {
       return "very_close";
    } else if (distance < 10000) {
        return "close";
    } else if (distance < 25000) {
        return "far";
    } else {
        return "very_far";
    }
}

export const getExactDistance = (a: Location, b: Location) => {
    return geo.getDistanceSimple(a, b);
}