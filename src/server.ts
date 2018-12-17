import * as bodyParser from 'body-parser';
import * as swagger from 'swagger-express-ts';
import * as http from 'http';
import "reflect-metadata";
import * as morgan from 'morgan';
import * as fs from 'fs';
import * as path from 'path';
import * as express from "express";
import * as cors from "cors";
import { getUserFromToken } from './services/firebase';
import { createConnection } from 'typeorm';
import { Post } from './models/post';
import { Profile } from './models/profile';
import { Comment } from './models/comment';
import { Channel } from './models/channel';
import { AppSchema } from './schema/schema';
import { ProfileVotePost } from './models/profile-vote-post';
const { ApolloServer } = require('apollo-server-express');

const accessLogStream = fs.createWriteStream(path.join(__dirname + '/static', '/access.log'), { flags: 'a' });
const logger = morgan('combined', { stream: accessLogStream });

const PORT = process.env.SERVER_PORT || 3000;

const app = express();

app.use('/', express.static('src/static'));

// config for express
app.use(logger);

app.use(swagger.express({
    definition : {
        info : {
            title : "Habla API" ,
            version : "1.0"
        },
    },
}));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


app.use(cors({ 
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

app.use(async(req, res, next) => {
    let user = req.headers['authorization']? await getUserFromToken(req.headers['authorization']): null;

    if (!user) {
        res.status(401).end();
        return;
    }

    req['user'] = user;

    next();
});

const server = new ApolloServer({ typeDefs: AppSchema.typeDefs, resolvers: AppSchema.resolvers, context: async({ req }) => {
    let user = req['user'];
    let location = { latitude: req.headers['latitude'], longitude: req.headers['longitude'] };

    return { user, location };
} });

server.applyMiddleware({ app });

const httpServer = http.createServer(app);

console.log('Starting server...');

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
        ProfileVotePost
    ]
}).then(() => {
    httpServer.listen(PORT);

    console.log(`Listening on port ${PORT}.`);
}).catch(error => {
    console.log("Error stablishing database connection.");
    console.log(error);
});

export default app;