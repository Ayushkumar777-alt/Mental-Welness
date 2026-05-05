const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emotionalScore: {
    type: Number,
    required: true
  },
  physicalScore: {
    type: Number,
    required: true
  },
  cognitiveScore: {
    type: Number,
    required: true
  },
  totalScore: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
