const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    }
});

UserSchema.pre('save', function(next) {
    if (this.isModified('password')) {
        this.password = this.encryptPassword(this.password);
    }
    next();
});

UserSchema.post('save', function(error, doc, next) {
    if (error.name === 'BulkWriteError' && error.code === 11000) {
        return next(new Error('Duplicate username'));
    }
    next();
});

UserSchema.methods.authenticate = function(plainTextPassword) {
    return bcrypt.compareSync(plainTextPassword, this.password);
}

UserSchema.methods.encryptPassword = function(plainTextPassword) {
    if (!plainTextPassword) {
        return '';
    }
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(plainTextPassword, salt);
}

module.exports = mongoose.model('user', UserSchema);
