const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Conversation = require('../models/conversation');
const mongoose = require('mongoose');

router.post('/', async (req, res, next) => {
    // Grab the _id from req.session, if there isn't one then throw an error. 
    // Grab the other _id (the user to start a conversation with) from req.body.
    // Create a new conversation with those two users.
    // Should the first message also be added here???
    // Return the created conversation as JSON.
    const { currentUserId } = req.session;
    const { userId, messageText } = req.body;
    if (!currentUserId) {
        return res.status(401).json({ error: 'Not logged in' });
    } else if (!userId) {
        return res.status(400).json({ error: 'You did not select a user to talk to' });
    }
    try {

        // Create the message as a plain object.
        const message = {
            author: currentUserId,
            body: messageText
        };

        const userObjectId = mongoose.Types.ObjectId(userId);
        const currentUserObjectId = mongoose.Types.ObjectId(currentUserId);

        // If there is  a conversation whose participants have currentUserId and userId, then grab it,
        // push the message to it, save it and return saved copy. 
        const existingConversation = await Conversation.findOne({ 
            participants: { 
                $all: [ userObjectId, currentUserObjectId ]  
            } 
        });
        if (existingConversation) {
            existingConversation.messages.push(message);
            const savedConversation = await existingConversation.save();
            res.json({ conversation: savedConversation });
        } else {
            // If not, then create it as below:
            const newConversation = await Conversation.create({
                participants: [
                    currentUserId,
                    userId
                ],
                messages: [ message ]
            });
            const populatedConversation = await newConversation.populate('participants').execPopulate();
            res.json({ conversation: populatedConversation });
        }
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
            return res.status(401).json({ error: 'Not logged in' });
        }
        try {
            const conversation = await Conversation.findById(conversationId)
                .populate('participants')
                .exec();
            if (conversation.participants.find(user => user._id.equals(currentUserId) )) {
                res.json({ conversation });
            } else {
                res.status(401).json({ error: 'You are not authorised to access this conversation' });
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
            return res.status(401).json({ error: 'Not logged in' });
        } else if (!text) {
            return res.status(400).json({ error: 'No message text supplied' });
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
                res.status(401).json({ error: 'You are not authorised to access this conversation' });
            }
        } catch (error) {
            next(error);
        }
    });

module.exports = router;
