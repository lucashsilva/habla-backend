import { injectable } from 'inversify';
import { createConnection, Connection } from 'typeorm';
import { Post } from '../models/post';
import { Channel } from '../models/channel';
import { Profile } from '../models/profile';
import { Comment } from '../models/comment';

@injectable()
export class DatabaseService {
    private readyPromise$: Promise<Connection>;

    constructor() {
        this.readyPromise$ = createConnection({
            type: "postgres",
            username: process.env.DB_USER || "habla",
            password: process.env.DB_PASSWORD || "habla",
            database: process.env.DB_NAME || "habla",
            synchronize: true,
            entities: [
                Post,
                Comment,
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