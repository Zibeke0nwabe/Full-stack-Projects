const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Landing Route
router.get('/', (req, res) => {
  res.render('index');
});

// Serve the login page
router.get('/login', (req, res) => {
  res.render('login', { errorMessage: '' });
});

// Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res.render('login', { errorMessage: 'Invalid email or user not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.render('login', { errorMessage: 'Invalid credentials' });

    req.session.username = user.username;
    req.session.balance = user.balance;

    res.redirect('/home');
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { errorMessage: 'Error logging in' });
  }
});

// Serve the registration page
router.get('/register', (req, res) => {
  res.render('register', { errorMessage: '' });
});

// Handle registration
router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword, referralCode } = req.body;

  if (password !== confirmPassword) {
    return res.render('register', { errorMessage: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { errorMessage: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      referralCode: generateReferralCode(),
      verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
      codeExpires: Date.now() + 3600000 // 1 hour
    });

    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referrer.pandingBalance = (referrer.pandingBalance || 0) + 5; // Add R5 to referrer's pending balance
        await referrer.save();

        await sendReferralNotification(referrer.email, username);
      }
    }

    await user.save();
    await sendVerificationEmail(email, user.verificationCode);
    req.session.email = email; // Store email in session
    res.render('register-verify', { email, errorMessage: '' });
  } catch (error) {
    console.error('Registration error:', error);
    res.render('register', { errorMessage: 'Error registering user' });
  }
});

// Serve the forgot password page
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { errorMessage: '' });
});

// Handle forgot password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('forgot-password', { errorMessage: 'User not found' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verificationCode;
    user.codeExpires = Date.now() + 3600000; // 1 hour

    await user.save();
    await sendPasswordResetEmail(email, verificationCode);
    req.session.email = email; // Store email in session
    res.render('verify-password', { errorMessage: '' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.render('forgot-password', { errorMessage: 'Error processing request' });
  }
});

// Handle verification code for registration
router.post('/verify', async (req, res) => {
  const { verificationCode } = req.body;
  const email = req.session.email; // Get email from session

  try {
    const user = await User.findOne({ email });
    if (!user || user.verificationCode !== verificationCode || user.codeExpires < Date.now()) {
      return res.render('register-verify', { email, errorMessage: 'Incorrect verification code or code has expired.' });
    }
    
    user.verificationCode = undefined; // Clear the code
    user.codeExpires = undefined; // Clear expiration time
    user.isVerified = true; // Mark as verified
    await user.save();

    await sendThankYouEmail(email, user.referralCode);
    req.session.message = `Thank you for verifying your account! Your referral code is ${user.referralCode}. Share it with friends to earn R3 for every new user who uses your code!`;
    res.redirect('/home'); // Redirect to home
  } catch (error) {
    console.error('Verification error:', error);
    res.render('register-verify', { email, errorMessage: 'Error verifying code' });
  }
});

// Serve the verification page after sending the code
router.get('/verify-password', (req, res) => {
  res.render('verify-password', { errorMessage: '' });
});

// Handle verification code for password reset
router.post('/verify-password', async (req, res) => {
  const { verificationCode } = req.body;
  const email = req.session.email; // Get email from session

  try {
    const user = await User.findOne({ email });
    if (!user || user.verificationCode !== verificationCode || user.codeExpires < Date.now()) {
      return res.render('verify-password', { errorMessage: 'Invalid or expired verification code' });
    }

    // Code is valid, redirect to reset password page
    res.render('reset-password', { errorMessage: '' });
  } catch (error) {
    console.error('Verification error:', error);
    res.render('verify-password', { errorMessage: 'Error verifying code' });
  }
});

// Serve the reset password page
router.get('/reset', (req, res) => {
  res.render('reset-password', { errorMessage: '' });
});

// Handle reset password
router.post('/reset-password', async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render('reset-password', { errorMessage: 'Passwords do not match' });
  }

  try {
    const email = req.session.email; // Get email from session
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('reset-password', { errorMessage: 'User not found' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.verificationCode = undefined; // Clear the code
    user.codeExpires = undefined; // Clear expiration time
    await user.save();

    res.redirect('/home'); // Redirect to Home after password reset
  } catch (error) {
    console.error('Reset password error:', error);
    res.render('reset-password', { errorMessage: 'Error resetting password' });
  }
});

// Generate a random referral code
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase(); // Generates a random 6-character code
}

// Send verification email
async function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your email',
    text: `Your verification code is ${code}`
  };

  await transporter.sendMail(mailOptions);
}

// Send password reset email
async function sendPasswordResetEmail(email, code) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Code',
    text: `Your password reset code is ${code}`
  };

  await transporter.sendMail(mailOptions);
}

// Send thank you email with referral code
async function sendThankYouEmail(email, referralCode) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Thank You for Registering!',
    text: `Thank you for registering! Your referral code is: ${referralCode}. Share it with your friends to earn R3 for every new user who uses your code.`
  };

  await transporter.sendMail(mailOptions);
}

// Notify referrer of new user
async function sendReferralNotification(referrerEmail, username) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: referrerEmail,
    subject: 'New User Registered with Your Referral Code',
    text: `A new user, ${username}, has registered using your referral code. R5 has been added to your pending balance!`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = router;