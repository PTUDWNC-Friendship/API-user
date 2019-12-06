const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    _idStudent: mongoose.Schema.Types.ObjectId,
    rate: Number,
    comment: String
});

module.exports = mongoose.model('feedback', feedbackSchema);