const User = require('./models/user');
const Conversation = require('./models/conversation');

const getCurrentUsersConversations = async (socket) => {
    
    try {
        const currentUserId = socket.decoded_token._id;
        const conversations = await Conversation.find({ participants: currentUserId })
            .populate('participants')
            .select('-messages')
            .exec();
        socket.emit('gotConversations', { conversations });
    } catch (err) {
        console.log(err);
    }
}

const getConversation = async (socket, conversationId) => {
    try {
        const currentUserId = socket.decoded_token._id;
        const conversation = await Conversation.findById(conversationId)
            .populate('participants')
            .exec();
        if (conversation.participants.find(user => user._id.equals(currentUserId) )) {
            socket.emit('gotConversation', { conversation })
        } else {
            socket.emit('getConversationError', { error: 'You are not authorised to view this conversation' });
        }
    } catch (err) {
        console.log(err)
    }
}

const sendMessage = async (socket, conversationId, messageText, currentUsers) => {
    try {
        const currentUserId = socket.decoded_token._id;
        if (!messageText) {
            socket.emit('sendMessageError', { error: 'You must supply a message' });
        }
        const conversation = await Conversation.findById(conversationId)
            .populate('participants')
            .exec();
        if (conversation.participants.find(user => user._id.equals(currentUserId))) {
            conversation.messages.push({
                author: currentUserId,
                body: messageText
            });
            const savedConversation = await conversation.save();
            const otherParticipants = savedConversation.participants.filter(user => {
                return !user._id.equals(currentUserId);
            });
            otherParticipants.forEach(participant => {
                const idAsString = participant._id.toString();
                const socketId = currentUsers.get(idAsString);
                if (socketId) {
                    socket.to(socketId).emit('sentMessage', { conversation: savedConversation });
                }
            });
            socket.emit('sentMessage', { conversation: savedConversation });
        } else {
            socket.emit('sendMessageError', { error: 'You are not authorised to access this conversation' });
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    getCurrentUsersConversations,
    getConversation,
    sendMessage
};