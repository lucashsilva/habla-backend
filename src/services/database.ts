import { injectable } from 'inversify';
import { createConnection, Connection } from 'typeorm';
import { Post } from '../models/post';
import { Channel } from '../models/channel';

@injectable()
export class DatabaseService {
    private readyPromise$: Promise<Connection>;

    constructor() {
        this.readyPromise$ = createConnection({
            type: "postgres",
            database: "habla",
            username: "habla",
            password: "habla",
            synchronize: true,
            entities: [
                Post,
                Channel
            ]
        });

        this.readyPromise$.then(() => {
            console.log("Database connection stablished.");
        }).catch(err => {
            console.warn("Error stablishing database connection.");
            console.log(err);
        });
    }

    ready() {
        return this.readyPromise$;
    }
}