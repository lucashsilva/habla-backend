import { HablaError } from "../habla-error";
import { ErrorOptions } from "../error-options";

export abstract class HttpError extends HablaError {
    readonly abstract httpStatus: number;

    constructor(options?: ErrorOptions) {
        super(options);
    }
}