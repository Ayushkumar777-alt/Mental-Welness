const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');

// @route   POST /api/assessment
// @desc    Save assessment results

router.post('/', async (req, res) => {
    try {
        const {
            userId,
            emotionalScore,
            physicalScore,
            cognitiveScore,
            totalScore
        } = req.body;

        // Check if userId exists
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Create new assessment
        const newAssessment = new Assessment({
            userId,
            emotionalScore,
            physicalScore,
            cognitiveScore,
            totalScore
        });

        // Save to database
        const savedAssessment = await newAssessment.save();

        res.status(201).json({
            success: true,
            data: savedAssessment
        });

    } catch (err) {
        console.error('POST Assessment Error:', err.message);

        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// @route   GET /api/assessment/:userId
// @desc    Get latest assessment for a user

router.get('/:userId', async (req, res) => {
    try {

        const assessment = await Assessment
            .findOne({ userId: req.params.userId })
            .sort({ createdAt: -1 });

        // If no assessment found
        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: 'Assessment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: assessment
        });

    } catch (err) {
        console.error('GET Assessment Error:', err.message);

        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

module.exports = router;