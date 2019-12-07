const actions = require('../actions');

/**
 * Takes an event, with its associated data, and pushes it to a list of recipients. 
 * @param {Object} socket - A SocketIO socket instance.
 * @param {Array} participants - the array of participants to push the event to.
 * @param {String} eventName - the name of the event to push.
 * @param {*} eventData - the data to send along with the event.
 * @param {Object} onlineUsers - A Map that maps users _ids to socket ids for all currently
 * connected users.
 * @param {String} idToExclude - the id of a particular participant from the participants list
 * to exclude when pushing the event.
 */
const pushEventToParticipants = ({ socket, participants, eventName, eventData, onlineUsers, idToExclude }) => {
    participants.forEach(participant => {
        if (!idToExclude || !participant._id.equals(idToExclude)) {
            const idAsString = participant._id ? participant._id.toString() : participant.toString();
            const socketId = onlineUsers.get(idAsString);
            if (socketId) {
                socket.to(socketId).emit(eventName, eventData);
            }
        }
    });
    socket.emit(eventName, eventData);
}

module.exports = {
    pushEventToParticipants
};
