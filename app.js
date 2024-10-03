require('dotenv').config(); // Load environment variables
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer'); // Import nodemailer
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
// Use the quiz routes
app.use(quizRoutes);
// Use the random routes
app.use(randomRoutes);
// Use the video routes
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
  console.log(req.session);
  res.render('home', { username: req.session.username, balance: req.session.balance, pendingBalance: req.session.pendingBalance });
});

app.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { username: req.session.username, balance: req.session.balance, email: req.session.email });
});

app.get('/lesson', isAuthenticated, (req, res) => {
  res.render('lesson', { username: req.session.username, balance: req.session.balance, email: req.session.email });
});

// POST endpoint to update user balance
app.post('/api/users/:userId/update-balance', async (req, res) => {
  const { userId } = req.params; // Corrected to use userId
  const { amount } = req.body;

  try {
    const user = await User.findById(userId); // Use userId to find user
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update balance
    user.balance += amount;
    await user.save();

    res.json({ balance: user.balance });
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Withdrawal route
app.post('/withdraw', async (req, res) => { 
  const { amount, bank, account, email, } = req.body;

  // Validate amount (must be R1000 or more)
  if (amount < 1000) {
    return res.render('profile', { Message: 'Minimum withdrawal amount is R1000.',username: req.session.username, balance: req.session.balance, email: req.session.email  });
  }

  // Set up email transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Set up email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // or a specific admin email
    subject: 'Withdrawal Request',
    text: `Withdrawal Request:
      Amount: R${amount}
      Bank: ${bank}
      Account: ${account}
      User Email: ${email}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.render('profile', { Message: 'Withdrawal request sent successfully. We will verify your acount and call you within 24 Hours',username: req.session.username, balance: req.session.balance, email: req.session.email  });
  } catch (error) {
    console.error('Error sending email:', error);
    res.render('profile', { Message: 'An error occurred while sending your request.' , username: req.session.username, balance: req.session.balance, email: req.session.email });
  }
});

// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});
