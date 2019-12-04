const Conversation = require('../models/conversation');
const actions = require('../actions');
const { pushConversationToOtherParticipants } = require('./utils');

const sendMessage = async (socket, conversationId, messageText, currentUsers) => {
    try {
        const currentUserId = socket.decoded_token._id;
        if (!messageText) {
            return socket.emit(actions.sendMessageError, { error: 'You must supply a message' });
        }
        const conversation = await Conversation.findById(conversationId)
            .populate('participants')
            .populate({
                path: 'messages.author',
                model: 'user'
            })
            .exec();
        if (conversation.participants.find(user => user._id.equals(currentUserId))) {
            conversation.messages.push({
                author: currentUserId,
                body: messageText
            });
            const savedConversation = await conversation.save();
            const populatedConversation = await savedConversation
                .populate('participants')
                .populate({
                    path: 'messages.author',
                    model: 'user'
                })
                .execPopulate();
            pushConversationToOtherParticipants(socket, currentUserId, populatedConversation, currentUsers);
            socket.emit(actions.sendMessageResponse, { conversation: populatedConversation });
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
