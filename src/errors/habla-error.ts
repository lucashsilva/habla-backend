import { ErrorOptions } from "./error-options";

export abstract class HablaError {
    readonly message: string;

    constructor(options?: ErrorOptions) {
        this.message = options && options.message || 'An error ocurred.';
    }
}