import * as bodyParser from 'body-parser';
import * as http from 'http';
import "reflect-metadata";
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { PostController } from './controllers/post';
import { DatabaseService } from './services/database';
import * as morgan from 'morgan';
import * as fs from 'fs';
import * as path from 'path';
import { ChannelController } from './controllers/channel';

const accessLogStream = fs.createWriteStream(path.join(__dirname + '/static', '/access.log'), { flags: 'a' });
const logger = morgan('combined', { stream: accessLogStream });

const PORT = process.env.SERVER_PORT || 3000;

const container = new Container();

container.bind(PostController);
container.bind(ChannelController);
container.bind<DatabaseService>(DatabaseService).to(DatabaseService).inSingletonScope();

// create server
const server = new InversifyExpressServer(container);

server.setConfig((app) => {
    // config for express
    app.use(logger);
    
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    
    app.use(bodyParser.json());
});

const app = server.build();

container.get(DatabaseService).ready().then(() => {
    // create the http server
    const httpServer = http.createServer(app);
    httpServer.listen(PORT);

    console.log(`Listening on port ${PORT}.`);
});