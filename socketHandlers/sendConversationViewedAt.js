const Conversation = require('../models/conversation');
const actions = require('../actions');
const { pushConversationToOtherParticipants } = require('./utils');

const sendConversationViewedAt = async (socket, conversationId, timestamp, currentUsers) => {
    try {
        const currentUserId = socket.decoded_token._id;
        const conversation = await Conversation.findById(conversationId);
        const plv = conversation.participantsLastViewed.find(p => p.user.equals(currentUserId));
        if (plv) {
            plv.lastViewed = timestamp;
            const savedConversation = await conversation.save().then(c => c.fullPopulate());
            pushConversationToOtherParticipants(socket, currentUserId, savedConversation, currentUsers);
            socket.emit(actions.sendConversationViewedAtResponse, conversation);
        }
    } catch (err) {
        console.log(err);
    }
}