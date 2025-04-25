const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Render registration page
router.get('/register', (req, res) => {
    res.render('register');
});

// Handle user registration
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        return res.send('User with this username or email already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
        username,
        email,
        password: hashedPassword
    });

    await user.save();
    res.redirect('/auth/login');
});

// Render login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Handle user login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
        return res.send('Invalid username or password.');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.send('Invalid username or password.');
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Set token in cookie
    res.cookie('auth-token', token, { httpOnly: true });

    res.redirect('/dashboard');
});

// Handle user logout
router.get('/logout', (req, res) => {
    res.clearCookie('auth-token');
    res.redirect('/');
});

module.exports = router;


