const express = require("express");
const Post = require('../models/post');

router = express.Router();

router.get("/", async(req, res) => {
    try {
        console.log(req.query)
        res.send(await Post.findNear([parseFloat(req.query.lat), parseFloat(req.query.lon)], parseFloat(req.query.maxDistance)));
    } catch (err) {
        console.log(err);
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