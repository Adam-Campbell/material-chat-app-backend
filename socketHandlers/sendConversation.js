const Conversation = require('../models/conversation');
const actions = require('../actions');
const mongoose = require('mongoose');
const { pushConversationToOtherParticipants } = require('./utils');

const sendConversation = async (socket, userIds, messageText, currentUsers) => {
    try {
        const currentUserId = socket.decoded_token._id;
        if (!userIds.length) {
            return socket.emit(
                actions.sendConversationError, 
                { error: 'You did not select a user to talk to' }
            );
        } else if (!messageText) {
            return socket.emit(
                actions.sendConversationError,
                { error: 'You did not specify a message to send' }
            );
        }
    
        // Create the message as a plain object.
        const message = {
            author: currentUserId,
            body: messageText
        };

        //const userObjectId = mongoose.Types.ObjectId(userId);
        //const currentUserObjectId = mongoose.Types.ObjectId(currentUserId);

        const userObjectIds = [currentUserId, ...userIds].map(id => mongoose.Types.ObjectId(id));

        // If there is  a conversation whose participants have currentUserId and userId, then grab it,
        // push the message to it, save it and return saved copy. 
        const existingConversation = await Conversation.findOne({ 
            participants: { 
                $all: userObjectIds
            } 
        })
        .populate('participants')
        .populate({
            path: 'messages.author',
            model: 'user'
        })
        .exec();
        if (existingConversation) {
            existingConversation.messages.push(message);
            const savedConversation = await existingConversation.save();
            const populatedConversation = await savedConversation
                .populate('participants')
                .populate({
                    path: 'messages.author',
                    model: 'user'
                })
                .execPopulate();
            pushConversationToOtherParticipants(socket, currentUserId, populatedConversation, currentUsers);
            socket.emit(actions.sendConversationResponse, { conversation: populatedConversation });
        } else {
            // If not, then create it as below:
            const newConversation = await Conversation.create({
                participants: [
                    currentUserId,
                    ...userIds
                ],
                messages: [ message ]
            });
            //res.json({ conversation: newConversation });
            const populatedConversation = await newConversation
                .populate('participants')
                .populate({
                    path: 'messages.author',
                    model: 'user'
                })
                .execPopulate();
            pushConversationToOtherParticipants(socket, currentUserId, populatedConversation, currentUsers);
            socket.emit(actions.sendConversationResponse, { conversation: populatedConversation });
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = sendConversation;
