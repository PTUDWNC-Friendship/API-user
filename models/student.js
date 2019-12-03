const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    hiredTutors: {
        type: Array
    }
});

module.exports = mongoose.model('student', userSchema);