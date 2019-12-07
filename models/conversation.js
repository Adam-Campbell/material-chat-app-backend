const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MessageSchema = require('./message');
const ParticipantLastViewedSchema = require('./participantLastViewed');

const ConversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    }],
    participantsLastViewed: {
        type: [ ParticipantLastViewedSchema ],
        required: true 
    },
    messages: {
        type: [ MessageSchema ],
        required: true
    },
    latestActivity: {
        type: Date
    }
});

ConversationSchema.methods.fullPopulate = function() {
    return this.populate('participants')
        .populate({
            path: 'messages.author',
            model: 'user'
        })
        .populate({
            path: 'participantsLastViewed.user',
            model: 'user'
        })
        .execPopulate();
}

ConversationSchema.pre('save', function(next) {
    if (this.messages.length) {
        const timestamp = this.messages[this.messages.length-1].createdAt;
        this.latestActivity = timestamp;
    }
    next();
});

module.exports = mongoose.model('conversation', ConversationSchema);
