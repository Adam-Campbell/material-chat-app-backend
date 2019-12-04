const Conversation = require('../models/conversation');
const actions = require('../actions');

const getCurrentUsersConversations = async (socket) => {
    
    try {
        const currentUserId = socket.decoded_token._id;
        const conversations = await Conversation.find({ participants: currentUserId })
            .populate('participants')
            .select('-messages')
            .exec();
        socket.emit(actions.getCurrentUsersConversationsResponse, { conversations });
    } catch (err) {
        console.log(err);
        socket.emit(actions.getCurrentUsersConversationsError);
    }
}

module.exports = getCurrentUsersConversations;