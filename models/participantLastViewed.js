const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParticipantLastViewedSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    lastViewed: {
        type: Date
    }
});

module.exports = ParticipantLastViewedSchema;