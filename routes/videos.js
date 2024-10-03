//routes/quiz
const express = require('express');
const router = express.Router();
//get video routes
router.get('/video-ads', (req, res) => {
    if (!req.session.username) return res.redirect('/login'); // Ensure user is logged in
    res.render('video-ads', { username: req.session.username, balance: req.session.balance, email: req.session.email});
});

module.exports = router;