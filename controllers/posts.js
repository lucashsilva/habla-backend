const express = require("express");
const Post = require('../models/post');

router = express.Router();

router.get("/", async(req, res) => {
    if (!(req.query.lat && req.query.lon && req.query.maxDistance)) {
        res.status(400).send({ message: 'Params lat, lon and maxDistance are required.' });
        return;
    }

    try {
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