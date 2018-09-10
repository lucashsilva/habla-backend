import { injectable } from 'inversify';
import { createConnection, Connection } from 'typeorm';
import { Post } from '../models/post';
import { Channel } from '../models/channel';
import { Profile } from '../models/profile';

@injectable()
export class DatabaseService {
    private readyPromise$: Promise<Connection>;

    constructor() {
        this.readyPromise$ = createConnection({
            type: "postgres",
            username: "habla",
            password: "habla",
            database: "habla",
            synchronize: true,
            entities: [
                Post,
                Channel,
                Profile
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