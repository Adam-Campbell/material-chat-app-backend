const actions = require('../actions');

/**
 * Takes a conversation and pushes it to the clients of each of its participants that are currently
 * online / connected.
 * @param {Object} socket - A SocketIO socket instance. 
 * @param {*} currentUserId  - The _id of the current user as a string
 * @param {*} conversation - The conversation to be pushed
 * @param {*} onlineUsers - A dictionary that maps users _ids to socket ids for all currently
 * connected users.
 */
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

const pushEventToParticipants = (socket, participants, eventName, eventData, onlineUsers) => {
    participants.forEach(participant => {
        //const idAsString = participant.toString();
        const idAsString = participant._id ? participant._id.toString() : participant.toString();
        const socketId = onlineUsers.get(idAsString);
        if (socketId) {
            socket.to(socketId).emit(eventName, eventData);
        }
    });
    socket.emit(eventName, eventData);
}

module.exports = {
    pushConversationToOtherParticipants,
    pushEventToParticipants
};
