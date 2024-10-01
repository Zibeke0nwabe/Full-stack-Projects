// routes/quiz.js
const express = require('express');
const router = express.Router();

let currentQuestionIndex = 0;
const quizQuestions = [
    {
      question: "What is the nickname of Port St Johns?",
      options: ["A) The Pearl of the Wild Coast", "B) The Gateway to Paradise", "C) The Jewel of the South", "D) The Hidden Treasure"],
      correctAnswer: "A) The Pearl of the Wild Coast"
    },
    {
      question: "Which river flows through Port St Johns?",
      options: ["A) Umzimvubu River", "B) Buffalo River", "C) Kowie River", "D) Sundays River"],
      correctAnswer: "A) Umzimvubu River"
    },
    {
      question: "What type of climate does Port St Johns have?",
      options: ["A) Tropical", "B) Mediterranean", "C) Desert", "D) Continental"],
      correctAnswer: "A) Tropical"
    },
    {
      question: "What popular beach is located in Port St Johns?",
      options: ["A) Cape St Francis", "B) Second Beach", "C) Victoria Bay", "D) Durban Beach"],
      correctAnswer: "B) Second Beach"
    },
    {
      question: "Which festival is celebrated annually in Port St Johns?",
      options: ["A) Port St Johns Music Festival", "B) Wild Coast Jazz Festival", "C) Port St Johns Arts Festival", "D) Umzimvubu River Festival"],
      correctAnswer: "C) Port St Johns Arts Festival"
    },
    {
      question: "What is a popular activity for tourists in Port St Johns?",
      options: ["A) Skiing", "B) Bungee Jumping", "C) Whale Watching", "D) Ice Climbing"],
      correctAnswer: "C) Whale Watching"
    },
    {
      question: "Which animal is commonly seen along the coast of Port St Johns?",
      options: ["A) Dolphins", "B) Polar Bears", "C) Penguins", "D) Sea Lions"],
      correctAnswer: "A) Dolphins"
    },
    {
      question: "What is the main industry in Port St Johns?",
      options: ["A) Agriculture", "B) Tourism", "C) Fishing", "D) Manufacturing"],
      correctAnswer: "B) Tourism"
    },
    {
      question: "What is the historical significance of Port St Johns?",
      options: ["A) A major trade route", "B) A historical shipwreck site", "C) A battleground", "D) A gold mining area"],
      correctAnswer: "A) A major trade route"
    },
    {
      question: "What type of ecosystem is found around Port St Johns?",
      options: ["A) Rainforest", "B) Savannah", "C) Coastal Dunes", "D) Alpine"],
      correctAnswer: "C) Coastal Dunes"
    }
  ];
 // Start quiz
router.get('/quiz', (req, res) => {
    if (!req.session.username) return res.redirect('/login'); // Ensure user is logged in
    const question = quizQuestions[currentQuestionIndex];
    res.render('quiz', { username: req.session.username, balance: req.session.balance, question  });
});

// Submit quiz answer
router.post('/quiz/answer', (req, res) => {
    const userAnswer = req.body.answer;
    const currentQuestion = quizQuestions[currentQuestionIndex];

    // Move to the next question
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
        return res.json({ nextQuestion: true }); // Indicate to show ads
    } else {
        // Quiz finished
        currentQuestionIndex = 0; // Reset for next quiz
        return res.json({ nextQuestion: false }); // Indicate quiz completion
    }
});

module.exports = router;