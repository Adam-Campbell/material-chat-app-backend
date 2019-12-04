const User = require('../models/user');
const actions = require('../actions');
const mongoose = require('mongoose');

const getUsers = async (socket, query, ) => {
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
