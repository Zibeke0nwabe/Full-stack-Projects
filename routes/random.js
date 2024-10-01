// routes/random.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.session.username) {
        return next();
    }
    res.redirect('/login');
};

// GET route to serve the random game page
router.get('/random', isAuthenticated, (req, res) => {
    res.render('random', {
        username: req.session.username,
        balance: req.session.balance
    });
});

// POST route to update the user's balance
router.post('/update-balance', isAuthenticated, async (req, res) => {
    const { amount } = req.body;
    const username = req.session.username;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Update the balance
        user.balance += amount;
        await user.save();

        // Update session balance
        req.session.balance = user.balance;

        return res.status(200).json({ success: true, balance: user.balance });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

module.exports = router;
