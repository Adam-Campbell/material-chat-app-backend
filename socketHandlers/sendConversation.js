const Conversation = require('../models/conversation');
const actions = require('../actions');
const mongoose = require('mongoose');
const { pushConversationToOtherParticipants } = require('./utils');

const sendConversation = async (socket, userIds, messageText, currentUsers) => {
    try {
        const currentUserId = socket.decoded_token._id;
        if (!userIds.length) {
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

        const userObjectIds = [currentUserId, ...userIds].map(id => mongoose.Types.ObjectId(id));

        // If there is  a conversation whose participants have currentUserId and userId, then grab it,
        // push the message to it, save it and return saved copy. 
        const existingConversation = await Conversation.findOne({ 
            participants: { 
                $all: userObjectIds
            } 
        });

        if (existingConversation) {
            existingConversation.messages.push(message);
            const savedConversation = await existingConversation.save().then(c => c.fullPopulate());
            pushConversationToOtherParticipants(socket, currentUserId, savedConversation, currentUsers);
            socket.emit(actions.sendConversationResponse, { conversation: savedConversation });
        } else {

            // If not, then create it as below:
            const newConversation = await Conversation.create({
                participants: [ currentUserId, ...userIds ],
                messages: [ message ]
            })
            .then(c => c.fullPopulate());
            pushConversationToOtherParticipants(socket, currentUserId, newConversation, currentUsers);
            socket.emit(actions.sendConversationResponse, { conversation: newConversation });
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = sendConversation;
