const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');

router.get('/', async (req, res, next) => {
    // retrieve all User instances and return as JSON.
    try {
        const users = await User.find({});
        res.json({ users });
    } catch (error) {
        next(error);
    }
});

router.get('/search', async (req, res, next) => {
    const { query } = req.query;
    const { currentUserId } = req.session;
    try {

        const currentUserObjectId = mongoose.Types.ObjectId(currentUserId);

        const regExp = new RegExp(query, 'i');
        const users = await User.where('username').regex(regExp).where('_id').ne(currentUserObjectId);
        res.json({ users });


    } catch (error) {
        next(error);
    }
});

module.exports = router;

