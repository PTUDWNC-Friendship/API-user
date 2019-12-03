const mongoose = require('mongoose');

const tutorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    subject: {
        type: Array,
        require: false
    },
    feedback: {
        type: Array,
        require: false
    }
});

module.exports = mongoose.model('tutor', userSchema);