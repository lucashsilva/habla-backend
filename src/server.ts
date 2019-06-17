import * as bodyParser from 'body-parser';
import * as http from 'http';
import "reflect-metadata";
import * as morgan from 'morgan';
import * as fs from 'fs';
import * as path from 'path';
import * as express from "express";
import * as cors from "cors";
import { createConnection } from 'typeorm';
import { Post } from './models/post';
import { Profile } from './models/profile';
import { Comment } from './models/comment';
import { Channel } from './models/channel';
import { AppSchema } from './schema/schema';
import { ProfileVotePost } from './models/profile-vote-post';
import { ApolloServer } from 'apollo-server-express';
import { requireAuthentication } from './services/firebase';
import { Notification } from './models/notification';
import { ProfileScoreRecord } from './models/profile-score-record';
import { PostMapChannel } from './models/post-map-channel';
import HablaErrorCodes from './errors/error-codes'
import { ProfileFollowPost } from './models/profile-follow-post';
import { HablaError } from './errors/habla-error';

const accessLogStream = fs.createWriteStream(path.join(__dirname + '/static', '/access.log'), { flags: 'a' });
const logger = morgan('combined', { stream: accessLogStream });

const PORT = process.env.SERVER_PORT || 3000;

const app = express();

// config for express
app.use(logger);

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json(
    {
        limit: '10mb'
    }
));

app.use(cors({ 
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

const server = new ApolloServer({ 
    typeDefs: AppSchema.typeDefs, 
    resolvers: AppSchema.resolvers,
    uploads: {
        maxFieldSize: 10000000,
        maxFileSize: 10000000
    },
    context: async({ req }) => {
        const location = { latitude: req.headers['latitude'], longitude: req.headers['longitude'] };
        
        const user = await requireAuthentication(req);

        return { location, user };
    },
    formatError: (err) => {
        console.log(err);
        let codes = Object.keys(HablaErrorCodes).filter(key => (HablaErrorCodes[key]));
        
        if (codes.includes(err.extensions.code) || err.extensions.code.startsWith("GRAPHQL")){
            return { code: err.extensions.code, message: err.message };
        } else {
            return { code: HablaErrorCodes.INTERNAL_SERVER_ERROR, message: "Internal server error." };
        }
    }
});

server.applyMiddleware({ app });

const httpServer = http.createServer(app);

createConnection({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    username: process.env.DB_USER || "habla",
    password: process.env.DB_PASSWORD || "habla",
    database: process.env.DB_NAME || "habla",
    synchronize: true,
    logging: false,
    entities: [
        Profile,
        Post,
        Comment, 
        Channel,
        ProfileVotePost,
        Notification,
        ProfileScoreRecord,
        PostMapChannel,
        ProfileFollowPost
    ]
}).then(() => {
    httpServer.listen(PORT);

    console.log(`Listening on port ${PORT}.`);
}).catch(error => {
    console.log("Error stablishing database connection.");
    console.log(error);
});

export default app;