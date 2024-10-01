const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 5 },
    referral: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationCode: { type: String }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
