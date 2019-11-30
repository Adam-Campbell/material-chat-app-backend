const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Conversation = require('../models/conversation');

router.get('/', async (req, res, next) => {
    // Grab the users _id from req.session, if no _id on req.session then return error.
    // If there is _id, retreive the User instance with that _id and return as JSON.
    const { currentUserId } = req.session;
    if (!currentUserId) {
        return res.json({ error: 'Not logged in' });
    }
    try {
        const currentUser = await User.findById(currentUserId);
        res.json({ user: currentUser });
    } catch (error) {
        next(error);
    }
});

router.get('/conversations', async (req, res, next) => {
    // Grab the users _id from req.session, if no _id on req.session then return error.
    // If there is _id, retrieve all conversations involving that user. 
    // However, do not return the messages field on those conversations.
    // Return the conversations as JSON.
    const { currentUserId } = req.session;
    if (!currentUserId) {
        return res.json({ error: 'Not logged in' });
    }
    try {
        // We need to find all Conversations where the participants array includes a user
        // whose _id matches currentUserId
        const conversations = await Conversation.find({ participants: currentUserId })
            .populate('participants')
            .select('-messages')
            .exec();
        res.json({ conversations });
    } catch (error) {
        next(error)
    }
});

module.exports = router;
