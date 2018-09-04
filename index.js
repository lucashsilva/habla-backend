const express = require("express");
const postsController = require("./controllers/posts");
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const accessLogStream = fs.createWriteStream(path.join(__dirname + '/static', '/access.log'), { flags: 'a' });
const logger = morgan('combined', { stream: accessLogStream });

mongoose.connect('mongodb://localhost/habla').then(() => {
    console.log("Database connection successful.");

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(logger);

    const router = express.Router();

    router.use("/posts", postsController);

    app.use("/api", router);

    app.use('/static', express.static('static'));

    app.listen(3000, () => {
        console.log("Listening on port 3000.");
    });
}).catch((err) => {
    console.warn("Failed connecting to database.");
    console.log(err);
});