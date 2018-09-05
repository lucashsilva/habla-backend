import * as bodyParser from 'body-parser';
import * as http from 'http';
import "reflect-metadata";
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { PostController } from './controllers/post';

let container = new Container();

container.bind(PostController);

// create server
let server = new InversifyExpressServer(container, null, { rootPath: "/api" }, null);

server.setConfig((app) => {
    // config for express
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    
    app.use(bodyParser.json());
});

let app = server.build();

// create the http server
const httpServer = http.createServer(app);
const port = 8080;
httpServer.listen(port);

console.log("Listening on port " + port + ".");