const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');

// @route   POST /api/mood
// @desc    Log a user's mood
router.post('/', async (req, res) => {
    try {
        const { userId, mood } = req.body;
        if (!userId || !mood) return res.status(400).json({ msg: 'User ID and mood are required' });

        const newMood = new Mood({ userId, mood });
        await newMood.save();
        res.json(newMood);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/mood/:userId
// @desc    Get latest mood for a user
router.get('/:userId', async (req, res) => {
    try {
        const mood = await Mood.findOne({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(mood);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
