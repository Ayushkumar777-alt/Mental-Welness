const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// @route   POST /api/posts
// @desc    Create a message board post
router.post('/', async (req, res) => {
    try {
        const { userId, username, text, style } = req.body;
        if (!userId || !text) return res.status(400).json({ msg: 'User ID and text are required' });

        const newPost = new Post({
            userId,
            username,
            text,
            style
        });
        await newPost.save();
        res.json(newPost);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/posts
// @desc    Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
