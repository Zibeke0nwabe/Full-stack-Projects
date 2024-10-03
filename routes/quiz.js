// routes/quiz.js
const express = require('express');
const router = express.Router();

let currentQuestionIndex = 0;
const quizQuestions = [
  {
      question: "What is Port St. Johns commonly known as?",
      options: [
          "A) The Pearl of the Wild Coast", 
          "B) The Gateway to the Ocean", 
          "C) The Jewel of the South", 
          "D) The Hidden Paradise"
      ],
      correctAnswer: "A) The Pearl of the Wild Coast"
  },
  {
      question: "Which river flows through Port St. Johns?",
      options: [
          "A) Umzimvubu River", 
          "B) Sundays River", 
          "C) Tsitsikamma River", 
          "D) Buffalo River"
      ],
      correctAnswer: "A) Umzimvubu River"
  },
  {
      question: "What type of climate characterizes Port St. Johns?",
      options: [
          "A) Mediterranean", 
          "B) Tropical", 
          "C) Desert", 
          "D) Temperate"
      ],
      correctAnswer: "B) Tropical"
  },
  {
      question: "What is a significant historical aspect of Port St. Johns?",
      options: [
          "A) It was a major trade route for early explorers.", 
          "B) It is known for its gold mining history.", 
          "C) It served as a naval base during the World Wars.", 
          "D) It is famous for its shipwrecks."
      ],
      correctAnswer: "A) It was a major trade route for early explorers."
  },
  {
      question: "Which type of ecosystem is found around Port St. Johns?",
      options: [
          "A) Coastal Dunes", 
          "B) Rainforest", 
          "C) Savanna", 
          "D) Alpine"
      ],
      correctAnswer: "A) Coastal Dunes"
  },
  {
      question: "What popular festival is celebrated annually in Port St. Johns?",
      options: [
          "A) Wild Coast Jazz Festival", 
          "B) Port St. Johns Music Festival", 
          "C) Umzimvubu Festival", 
          "D) Arts and Culture Festival"
      ],
      correctAnswer: "B) Port St. Johns Music Festival"
  },
  {
      question: "What is a common activity for tourists visiting Port St. Johns?",
      options: [
          "A) Whale Watching", 
          "B) Skiing", 
          "C) Bungee Jumping", 
          "D) Ice Climbing"
      ],
      correctAnswer: "A) Whale Watching"
  },
  {
      question: "Which animal is commonly seen along the coast of Port St. Johns?",
      options: [
          "A) Dolphins", 
          "B) Polar Bears", 
          "C) Penguins", 
          "D) Sea Lions"
      ],
      correctAnswer: "A) Dolphins"
  },
  {
      question: "What is the main industry in Port St. Johns?",
      options: [
          "A) Agriculture", 
          "B) Tourism", 
          "C) Fishing", 
          "D) Manufacturing"
      ],
      correctAnswer: "B) Tourism"
  },
  {
      question: "What is a key geographical feature of Port St. Johns?",
      options: [
          "A) It is surrounded by mountains.", 
          "B) It has a natural harbor.", 
          "C) It is located on a flat plain.", 
          "D) It has extensive wetlands."
      ],
      correctAnswer: "B) It has a natural harbor."
  }
];


// Start quiz
router.get('/quiz', (req, res) => {
    if (!req.session.username) return res.redirect('/login'); // Ensure user is logged in
    const question = quizQuestions[currentQuestionIndex];
    res.render('quiz', { username: req.session.username, balance: req.session.balance, question });
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
