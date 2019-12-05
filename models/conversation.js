const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MessageSchema = require('./message');

const ConversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    }],
    messages: {
        type: [ MessageSchema ],
        required: true
    }
});

ConversationSchema.methods.fullPopulate = function() {
    return this.populate('participants')
        .populate({
            path: 'messages.author',
            model: 'user'
        })
        .execPopulate();
}

module.exports = mongoose.model('conversation', ConversationSchema);
