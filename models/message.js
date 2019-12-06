const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    _idSender: mongoose.Schema.Types.ObjectId,
    _idRecipient: mongoose.Schema.Types.ObjectId,
    contents: String
});

module.exports = mongoose.model('message', messageSchema);