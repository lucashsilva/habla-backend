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

router.get("/:id", async(req, res) => {
    if (req.params.id) {
        try {
            const post = await Post.findById({ _id: req.params.id }).exec();

            if (post) {
                res.send(post);
            } else {
                res.status(404).end();
            }

            res.send();
        } catch (error) {
            res.staus(500).end();
        }
    } else {
        res.status(400).send({ message: "Missing post id." });
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

router.put("/:id", async(req,res) => {
    if (req.params.id) {
        try {
            let post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();

            if (post) {
                res.send(post);
            } else {
                res.status(404).end();
            }
        } catch (error) {
            res.status(500).end();
            console.log(error);
        }
    } else {
        res.status(400).send({ message: "Missing post id." });
    }
});

router.delete("/:id", async(req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id }).exec();
        res.status(200).end();
    } catch (error) {
        console.log(error);
        res.status(400).end();
    }
});

module.exports = router;