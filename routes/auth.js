const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const createSocketToken = _id => jwt.sign({ _id }, process.env.SOCKET_AUTH_SECRET, { expiresIn: 360 });

router.get('/check-for-session', async (req, res, next) => {
    const { currentUserId } = req.session;
    console.log('check for session was called');
    try {
        if (!currentUserId) {
            return res.json({ hasSession: false });
        } 
        const user = await User.findById(currentUserId);
        const socketToken = createSocketToken(user._id);
        res.json({ hasSession: true, user, socketToken });
    } catch (error) {
        next(error);
    }
});

router.post('/sign-in', async (req, res, next) => {
    // Grab username and password from req.body.
    // Verify that the username matches an existing user, else throw error.
    // Verify that the password given matches the password for that user, else
    // throw error. 
    // If everything matches add the users id to req.session and return a confirmation
    // message to client.
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username or password missing' });
    }
    try {
        const user = await User.findOne({ username }).select('+password').exec();
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        if (!user.authenticate(password)) {
            return res.status(401).json({ error: 'Incorrect password' });
        }
        req.session.currentUserId = user._id;
        //const socketToken = jwt.sign({ _id: user._id }, 'foobar', { expiresIn: 360 })
        const socketToken = createSocketToken(user._id);
        res.json({ signInSuccess: true, user, socketToken });
    } catch (error) {
        next(error);
    }
    
});

router.post('/sign-up', async (req, res, next) => {
    // If username or password is not supplied, or if username already exists, throw error.
    // Else create user, add users _id to req.session, and send confirmation message to client.
    const { username, password } = req.body; 
    if (!username || !password) {
        return res.status(400).json({ error: 'You must provide a username and password' });
    }
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(401).json({ error: 'Username is taken' });
        }
    } catch (error) {
        next(error);
    }
    try {
        const newUser = await User.create({ username, password });
        const newUserId = newUser._id;
        req.session.currentUserId = newUserId;
        const newUserObject = newUser.toObject();
        delete newUserObject.password;
        const socketToken = createSocketToken(newUserObject._id);
        res.json({ signUpSuccess: true, user: newUserObject, socketToken });
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

router.post('/check-username', async (req, res, next) => {
    const { username } = req.body;
    try {
        if (!username) {
            return res.status(400).json({ error: 'Must supply a username to check' });
        }
        const existingUser = await User.findOne({ username });
        return res.json({ isAvailable: !Boolean(existingUser) });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
