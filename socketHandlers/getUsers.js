const User = require('../models/user');
const actions = require('../actions');
const mongoose = require('mongoose');

// Return all users whose usernames contain `query`, except for the current user who will
// always be excluded from the results.
const getUsers = async (socket, query) => {
    try {
        const currentUserId = socket.decoded_token._id;
        const currentUserObjectId = mongoose.Types.ObjectId(currentUserId);
        const regExp = new RegExp(query, 'i');
        const users = await User.where('username').regex(regExp).where('_id').ne(currentUserObjectId);
        socket.emit(actions.getUsersResponse, { users });
    } catch (err) {
        console.log(err);
    }
};

module.exports = getUsers;
