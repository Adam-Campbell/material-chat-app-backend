const Conversation = require('../models/conversation');
const actions = require('../actions');
const mongoose = require('mongoose');
const { pushConversationToOtherParticipants } = require('./utils');

const sendConversation = async (socket, userId, messageText, currentUsers) => {
    try {
        const currentUserId = socket.decoded_token._id;
        if (!userId) {
            return socket.emit(
                actions.sendConversationError, 
                { error: 'You did not select a user to talk to' }
            );
        } else if (!messageText) {
            return socket.emit(
                actions.sendConversationError,
                { error: 'You did not specify a message to send' }
            );
        }
    
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
        })
        .populate('participants')
        .exec();
        if (existingConversation) {
            existingConversation.messages.push(message);
            const savedConversation = await existingConversation.save();
            pushConversationToOtherParticipants(socket, currentUserId, savedConversation, currentUsers);
            socket.emit(actions.sendConversationResponse, { conversation: savedConversation });
        } else {
            // If not, then create it as below:
            const newConversation = await Conversation.create({
                participants: [
                    currentUserId,
                    userId
                ],
                messages: [ message ]
            });
            //res.json({ conversation: newConversation });
            const populatedConversation = await newConversation.populate('participants').execPopulate();
            pushConversationToOtherParticipants(socket, currentUserId, populatedConversation, currentUsers);
            socket.emit(actions.sendConversationResponse, { conversation: populatedConversation });
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = sendConversation;
