const express = require("express");
const postsController = require("./controllers/posts");
const app = express();

const router = express.Router();

router.use("/posts", postsController);

app.use("/api", router);

app.listen(3000, () => {
    console.log("Listening on port 3000.");
});