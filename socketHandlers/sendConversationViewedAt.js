const Conversation = require('../models/conversation');
const actions = require('../actions');
const { pushConversationToOtherParticipants, pushEventToParticipants } = require('./utils');

/*

Find conversation by id and update

*/

const sendConversationViewedAt = async (socket, conversationId, timestamp, currentUsers) => {
    try {
        const currentUserId = socket.decoded_token._id;
        const conversation = await Conversation.findById(conversationId);
        const plv = conversation.participantsLastViewed.find(p => p.user.equals(currentUserId));
        if (plv) {
            plv.lastViewed = timestamp;
            const savedConversation = await conversation.save().then(c => c.fullPopulate());
            //pushConversationToOtherParticipants(socket, currentUserId, savedConversation, currentUsers);
            //socket.emit(actions.sendConversationViewedAtResponse, { conversation: savedConversation });
            pushEventToParticipants(
                socket,
                savedConversation.participants,
                actions.pushLastViewed,
                { lastViewed: savedConversation.participantsLastViewed, conversationId },
                currentUsers
            );
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = sendConversationViewedAt


// const sendConversationViewedAt = async (socket, conversationId, timestamp, currentUsers) => {
//     try {
//         const currentUserId = socket.decoded_token._id;
//         const conversation = await Conversation.findById(conversationId);
//         const plv = conversation.participantsLastViewed.find(p => p.user.equals(currentUserId));
//         if (plv) {
//             plv.lastViewed = timestamp;
//             const savedConversation = await conversation.save().then(c => c.fullPopulate());
//             pushConversationToOtherParticipants(socket, currentUserId, savedConversation, currentUsers);
//             socket.emit(actions.sendConversationViewedAtResponse, { conversation: savedConversation });
//         }
//     } catch (err) {
//         console.log(err);
//     }
// }