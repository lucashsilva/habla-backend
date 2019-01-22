import { ApolloError } from "apollo-server-core";

export class HablaError extends ApolloError {
    constructor(message: string, code: string) {
        super(message, code);
    }
}