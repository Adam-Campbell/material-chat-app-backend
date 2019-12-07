const resourceFetchingEvents = {
    getCurrentUsersConversationsRequest: 'get::currentUsersConverstations::request',
        // no args
    getCurrentUsersConversationsResponse: 'get::currentUsersConversations::response',
        // { conversations }
    getCurrentUsersConversationsError: 'get::currentUsersConversations::error',
        // { error }
    getConversationRequest: 'get::conversation::request',
        // { conversationId }
    getConversationResponse: 'get::conversation::response',
        // { conversation }
    getConversationError: 'get::conversation::error',
        // { error }
    getUsersRequest: 'get::users::request',
        // { query }
    getUsersResponse: 'get::users::response',
        // { users }
    getUsersError: 'get::users::error',
        // { error }
};

const sendToServerEvents = {
    // send actions for each resource that the client sends to the server
    sendMessage: 'send::message',
        // { conversationId, messageText }
    sendMessageError: 'send::message::error',
        // { error }
    sendConversation: 'send::conversation',
        // { userIds, messageText }
    sendConversationSuccess: 'send::conversation::success',
        // { conversationId }
    sendConversationError: 'send::conversation::error',
        // { error }
    sendLastViewed: 'send::lastViewed',
        // { conversationId, timestamp }
    sendLastViewedError: 'send::lastViewed::error',
        // { error }
};

const pushToClientEvents = {
    pushConversation: 'push::conversation',
        // { conversation }
    pushMessage: 'push::message',
        // { message, conversationId }
    pushLastViewed: 'push::lastViewed'
        // { lastViewed, conversationId }
};

module.exports = {
    ...resourceFetchingEvents,
    ...sendToServerEvents,
    ...pushToClientEvents
};
