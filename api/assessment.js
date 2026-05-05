const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');

// @route   POST /api/assessment
// @desc    Save assessment results
router.post('/', async (req, res) => {
    try {
        const { userId, emotionalScore, physicalScore, cognitiveScore, totalScore } = req.body;
        if (!userId) return res.status(400).json({ msg: 'User ID is required' });

        const newAssessment = new Assessment({
            userId,
            emotionalScore,
            physicalScore,
            cognitiveScore,
            totalScore
        });
        await newAssessment.save();
        res.json(newAssessment);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/assessment/:userId
// @desc    Get latest assessment for a user
router.get('/:userId', async (req, res) => {
    try {
        const assessment = await Assessment.findOne({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(assessment);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
