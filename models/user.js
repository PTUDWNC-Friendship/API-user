const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        require: true
    },
    phone: {
        type: Number,
        require: false
    },
    type: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: false
    },
    role: {
        type: String,
        require: true
    },
    bio: {
        type: String,
        require: false
    },
    imageURL: {
        type: String,
        require: false
    },
    activeStatus: {
        type: String,
        require: false
    }
});

module.exports = mongoose.model('user', userSchema);