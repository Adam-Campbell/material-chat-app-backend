const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/sign-in', async (req, res, next) => {
    // Grab username and password from req.body.
    // Verify that the username matches an existing user, else throw error.
    // Verify that the password given matches the password for that user, else
    // throw error. 
    // If everything matches add the users id to req.session and return a confirmation
    // message to client.
    const { username, password } = req.body;
    if (!username || !password) {
        return res.json({ error: 'You must provide a username and password' });
    }
    try {
        const user = await User.findOne({ username }).select('+password').exec();
        if (!user) {
            return res.json({ error: 'User not found' });
        }
        if (!user.authenticate(password)) {
            return res.json({ error: 'Incorrect password' });
        }
        req.session.currentUserId = user._id;
        res.json({ signInSuccess: true });
    } catch (error) {
        next(error);
    }
    
});

router.post('/sign-up', async (req, res, next) => {
    // If username or password is not supplied, or if username already exists, throw error.
    // Else create user, add users _id to req.session, and send confirmation message to client.
    const { username, password } = req.body; 
    if (!username || !password) {
        return res.json({ error: 'You must provide a username and password' });
    }
    try {
        const newUser = await User.create({ username, password });
        const newUserId = newUser._id;
        req.session.currentUserId = newUserId;
        res.json({ signUpSuccess: true });
    } catch (error) {
        next(error)
    }
});

router.get('/sign-out', async (req, res, next) => {
    // call req.session.destroy()
    req.session.destroy(error => {
        if (error) {
            return next(error);
        }
        res.json({ signOutSuccess: true });
    });
});

module.exports = router;
