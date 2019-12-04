const Conversation = require('../models/conversation');
const actions = require('../actions');

const getConversation = async (socket, conversationId) => {
    try {
        const currentUserId = socket.decoded_token._id;
        const conversation = await Conversation.findById(conversationId)
            .populate('participants')
            .populate({
                path: 'messages.author',
                model: 'user'
            })
            .exec();
        if (conversation.participants.find(user => user._id.equals(currentUserId) )) {
            socket.emit(actions.getConversationResponse, { conversation })
        } else {
            socket.emit(
                actions.getConversationError, 
                { error: 'You are not authorised to view this conversation' }
            );
        }
    } catch (err) {
        console.log(err);
        socket.emit(actions.getConversationError);
    }
}

module.exports = getConversation;
