const Conversation = require('../models/conversation');
const User = require('../models/user');
const actions = require('../actions');
const { pushConversationToOtherParticipants, pushEventToParticipants } = require('./utils');
const mongoose = require('mongoose');

const sendMessage = async (socket, conversationId, messageText, currentUsers) => {
    try {
        const currentUserId = socket.decoded_token._id;
        if (!messageText) {
            return socket.emit(actions.sendMessageError, { error: 'You must supply a message' });
        }
        const conversation = await Conversation.findById(conversationId);
        
        if (conversation.participants.find(userId => userId.equals(currentUserId))) {
            const newMessage = conversation.messages.create({
                author: currentUserId,
                body: messageText
            });
            conversation.messages.push(newMessage);
            const messageAsObject = newMessage.toObject();
            const username = await User.findById(currentUserId).then(user => user.username);
            const populatedMessage = {
                ...messageAsObject,
                author: {
                    _id: messageAsObject.author,
                    username
                }
            };
            await conversation.save();
            pushEventToParticipants(
                socket, 
                conversation.participants, 
                actions.pushMessage,
                { message: populatedMessage, conversationId },
                currentUsers
            );

        } else {
            socket.emit(
                actions.sendMessageError, 
                { error: 'You are not authorised to access this conversation' }
            );
        }
    } catch (err) {
        console.log(err);
    }
};

module.exports = sendMessage;


/*


const sendMessage = async (socket, conversationId, messageText, currentUsers) => {
    try {
        const currentUserId = socket.decoded_token._id;
        if (!messageText) {
            return socket.emit(actions.sendMessageError, { error: 'You must supply a message' });
        }
        const conversation = await Conversation.findById(conversationId);
        
        if (conversation.participants.find(userId => userId.equals(currentUserId))) {
            const timestamp = Date.now();
            //const messageId = mongoose.Types.ObjectId();
            conversation.messages.push({
                author: currentUserId,
                body: messageText,
                createdAt: timestamp
            });
            const plv = conversation.participantsLastViewed.find(p => p.user.equals(currentUserId));
            if (plv) {
                plv.lastViewed = timestamp;
            }
            const savedConversation = await conversation.save().then(c => c.fullPopulate());
            pushConversationToOtherParticipants(socket, currentUserId, savedConversation, currentUsers);
            socket.emit(actions.sendMessageResponse, { conversation: savedConversation });

        } else {
            socket.emit(
                actions.sendMessageError, 
                { error: 'You are not authorised to access this conversation' }
            );
        }
    } catch (err) {
        console.log(err);
    }
};



*/