const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true }
});
const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
module.exports = Quiz;