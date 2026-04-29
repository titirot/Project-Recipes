const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const userValidator = require('../validations/userValidation');

const register = async (req, res) => {
    const { error } = userValidator(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({ ...req.body, password: hashedPassword });
        const savedUser = await user.save();
        const { password, ...userWithoutPassword } = savedUser.toObject();

        return res.status(201).json(userWithoutPassword);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user._id.toString(), role: user.role, email: user.email },
            process.env.JWT_SECRET || 'dev_secret_change_me',
            { expiresIn: '7d' }
        );

        return res.status(200).json({ token });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getAllUsers = async (_req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const updatePassword = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user id' });
    }

    if (!password) {
        return res.status(400).json({ message: 'New password is required' });
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
        return res.status(400).json({
            message: 'Password must include uppercase, lowercase, number, and special character'
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.findByIdAndUpdate(
            id,
            { password: hashedPassword },
            { new: true, runValidators: false }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'Password updated successfully', user });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user id' });
    }
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { register, login, getAllUsers, updatePassword, deleteUser };
