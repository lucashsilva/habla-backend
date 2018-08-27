const express = require("express");
const postsController = require("./controllers/posts");
const app = express();
var bodyParser = require('body-parser')
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/habla').then(() => {
    console.log("Database connection successful.");

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    const router = express.Router();

    router.use("/posts", postsController);

    app.use("/api", router);

    app.listen(3000, () => {
        console.log("Listening on port 3000.");
    });
}).catch((err) => {
    console.warn("Failed connecting to database.");
    console.log(err);
});