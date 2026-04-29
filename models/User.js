const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, trim: true, minlength: 2 },
    password: { type: String, required: true, minlength: 8 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    address: { type: String, trim: true },
    role: { type: String, enum: ['admin', 'registered', 'user'], default: 'registered' }
});

module.exports = mongoose.model('User', userSchema);