const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/', async (req, res, next) => {
    // retrieve all User instances and return as JSON.
    try {
        const users = await User.find({});
        res.json({ users });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

