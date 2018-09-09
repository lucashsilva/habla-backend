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
            host: process.env.DATABASE_HOST,
            database: process.env.DATABASE_NAME,
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
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