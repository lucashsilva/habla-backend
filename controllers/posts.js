const express = require("express");
const Post = require('../models/post');

router = express.Router();

router.get("/", async(req, res) => {
    try {
        res.send(await Post.find());
    } catch (err) {
        res.status(500).end();
    }
});

router.post("/", async(req, res) => {
    const post = new Post(req.body);
    
    try {
        await post.save();

        res.send(post);
    } catch (err) {
        res.status(500).end();
    }
});

module.exports = router;