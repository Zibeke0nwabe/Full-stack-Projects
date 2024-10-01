// app.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const randomRoutes = require('./routes/random');
const videoRoutes = require('./routes/videos');
const User = require('./models/User');

const app = express();

// Middleware setup 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));

// Set view engine (assuming you are using EJS)
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

// Use the auth routes
app.use(authRoutes);
//Use the quiz routes
app.use(quizRoutes);
//Use the random routes
app.use(randomRoutes);
//Use the video routes
app.use(videoRoutes);
// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.username) {
    return next();
  }
  res.redirect('/login'); 
};

// Protected routes
app.get('/home', isAuthenticated, (req, res) => {
  res.render('home', { username: req.session.username, balance: req.session.balance });
});

app.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { username: req.session.username, balance: req.session.balance, email: req.session.email });
});

// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});