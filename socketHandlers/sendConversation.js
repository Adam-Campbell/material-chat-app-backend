const Conversation = require('../models/conversation');
const actions = require('../actions');
const mongoose = require('mongoose');
const { pushEventToParticipants } = require('./utils');

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
            body: messageText,
            _id: mongoose.Types.ObjectId(),
            createdAt: new Date()
        };

        const userObjectIds = [currentUserId, ...userIds].map(id => mongoose.Types.ObjectId(id));

        // Check if there is a conversation containing all of the desired users, and only them. 
        const existingConversation = await Conversation.findOne({ 
            participants: { 
                $all: userObjectIds,
                $size: userObjectIds.length
            } 
        });

        // If conversation found, push message to it, save, and emit event to notify clients.
        if (existingConversation) {
            existingConversation.messages.push(message);
            const savedConversation = await existingConversation.save().then(c => c.fullPopulate());
            pushEventToParticipants({
                socket,
                participants: existingConversation.participants,
                eventName: actions.pushMessage,
                eventData: { message, conversationId: savedConversation._id },
                onlineUsers: currentUsers,
                idToExclude: currentUserId
            });
            socket.emit(actions.sendConversationSuccess, { conversationId: savedConversation._id });
        } else {

            // If not, then create it with the message, and emit event. 
            const participantsLastViewedObjects = userObjectIds.map(id => ({ user: id }));
            const newConversation = await Conversation.create({
                participants: [ currentUserId, ...userIds ],
                messages: [ message ],
                participantsLastViewed: participantsLastViewedObjects
            })
            .then(c => c.fullPopulate());
            pushEventToParticipants({
                socket, 
                participants: newConversation.participants, 
                eventName: actions.pushConversation,
                eventData: { conversation: newConversation },
                onlineUsers: currentUsers,
                idToExclude: currentUserId
            });
            socket.emit(actions.sendConversationSuccess, { conversationId: newConversation._id });
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = sendConversation;
