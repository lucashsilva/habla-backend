import { injectable } from 'inversify';
import { createConnection, Connection } from 'typeorm';
import { Post } from '../models/post';

@injectable()
export class DatabaseService {
    private readyPromise$: Promise<Connection>;

    constructor() {
        this.readyPromise$ = createConnection({
            type: "sqljs",
            synchronize: true,
            entities: [
                Post
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