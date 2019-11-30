const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Conversation = require('../models/conversation');

router.post('/', async (req, res, next) => {
    // Grab the _id from req.session, if there isn't one then throw an error. 
    // Grab the other _id (the user to start a conversation with) from req.body.
    // Create a new conversation with those two users.
    // Should the first message also be added here???
    // Return the created conversation as JSON.
    const { currentUserId } = req.session;
    const { userId, messageText } = req.body;
    if (!currentUserId) {
        return res.json({ error: 'Not logged in' });
    } else if (!userId) {
        return res.json({ error: 'You did not select a user to talk to' });
    }
    try {
        const newConversation = await Conversation.create({
            participants: [
                currentUserId,
                userId
            ],
            messages: [{
                author: currentUserId,
                body: messageText
            }]
        });
        res.json({ conversationCreatedSuccess: true, conversation: newConversation });
    } catch (error) {
        next(error);
    }
});

router.route('/:conversationId')
    .get(async (req, res, next) => {
        // Grab the :id query param. 
        // Find the Conversation with that _id.
        // Return the full Conversation as JSON. 
        // If the conversation wasn't found return an error message. 
        const { conversationId } = req.params;
        const { currentUserId } = req.session;
        if (!currentUserId) {
            return res.json({ error: 'Not logged in' });
        }
        try {
            const conversation = await Conversation.findById(conversationId)
                .populate('participants')
                .exec();
            if (conversation.participants.find(user => user._id.equals(currentUserId) )) {
                res.json({ conversation });
            } else {
                res.json({ error: 'You are not authorised to access this conversation' });
            }
        } catch (error) {
            next(error);
        }
    })
    .post(async (req, res, next) => {
        // Grab the user _id from req.session, if there isn't one throw error / return error message.
        // Grab the :id query param.
        // Grab the message text from req.body. 
        // Find the Conversation with that _id.
        // If none found, return error message.
        // If found, add the message to the Conversation. 
        // Return what to the client? The full Conversation?
        const { conversationId } = req.params;
        const { currentUserId } = req.session;
        const { text } = req.body;
        if (!currentUserId) {
            return res.json({ error: 'Not logged in' });
        } else if (!text) {
            return res.json({ error: 'No message text supplied' });
        }
        try {
            const conversation = await Conversation.findById(conversationId)
                .populate('participants')
                .exec();
            if (conversation.participants.find(user => user._id.equals(currentUserId))) {
                //res.json({ conversation });
                conversation.messages.push({
                    author: currentUserId,
                    body: text
                });
                const savedConversation = await conversation.save();
                res.json({ conversation: savedConversation });
            } else {
                res.json({ error: 'You are not authorised to access this conversation' });
            }
        } catch (error) {
            next(error);
        }
    });

module.exports = router;
