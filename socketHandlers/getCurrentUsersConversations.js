const Conversation = require('../models/conversation');
const actions = require('../actions');

const getCurrentUsersConversations = async (socket) => {
    
    try {
        const currentUserId = socket.decoded_token._id;
        const conversations = await Conversation.find({ participants: currentUserId })
            .populate('participants')
            .populate({
                path: 'participantsLastViewed.user',
                model: 'user'
            })
            .select('-messages')
            .sort({ latestActivity: 'desc' })
            .exec();
        socket.emit(actions.getCurrentUsersConversationsResponse, { conversations });
    } catch (err) {
        console.log(err);
        socket.emit(actions.getCurrentUsersConversationsError);
    }
}

module.exports = getCurrentUsersConversations;