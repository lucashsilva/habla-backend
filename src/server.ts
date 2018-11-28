import * as bodyParser from 'body-parser';
import * as swagger from 'swagger-express-ts';
import * as http from 'http';
import "reflect-metadata";
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { PostController } from './controllers/post';
import { DatabaseService } from './services/database';
import * as morgan from 'morgan';
import * as fs from 'fs';
import * as path from 'path';
import * as express from "express";
import { ChannelController } from './controllers/channel';
import { AuthorizeMiddleware } from './middlewares/authorize';
import { AuthenticationService } from './services/authentication';
import { AuthenticationProvider } from './providers/authentication';
import { ProfileController } from './controllers/profile';
import { CommentController } from './controllers/comment';
import * as cors from 'cors';

const accessLogStream = fs.createWriteStream(path.join(__dirname + '/static', '/access.log'), { flags: 'a' });
const logger = morgan('combined', { stream: accessLogStream });

const PORT = process.env.SERVER_PORT || 3000;

const container = new Container();

container.bind<AuthorizeMiddleware>(AuthorizeMiddleware).to(AuthorizeMiddleware);

container.bind(PostController);
container.bind(ChannelController);
container.bind(ProfileController);
container.bind(CommentController);

container.bind<DatabaseService>(DatabaseService).to(DatabaseService).inSingletonScope();
container.bind<AuthenticationService>(AuthenticationService).to(AuthenticationService).inSingletonScope();

// create server
const server = new InversifyExpressServer(container, null, null, null, AuthenticationProvider);

server.setConfig((app) => {
    app.use('/api-docs/swagger', express.static('src/swagger'));
    app.use('/api-docs/swagger/assets', express.static('node_modules/swagger-ui-dist'));

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
        origin: 'http://localhost:3001',
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }));
});

const app = server.build();


container.get(DatabaseService).ready().then(() => {
    // create the http server
    const httpServer = http.createServer(app);
    httpServer.listen(PORT);

    console.log(`Listening on port ${PORT}.`);

    app.emit('ready');
}).catch(error => {
    console.log(error);
});

export default app;