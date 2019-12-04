const actions = require('../actions');

const pushConversationToOtherParticipants = (socket, currentUserId, conversation, onlineUsers) => {
    conversation.participants.filter(user => {
        return !user._id.equals(currentUserId);
    })
    .forEach(participant => {
        const idAsString = participant._id.toString();
        const socketId = onlineUsers.get(idAsString);
        if (socketId) {
            socket.to(socketId).emit(actions.pushConversation, { conversation });
        }
    });
}

module.exports = {
    pushConversationToOtherParticipants
}