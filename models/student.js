const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    hiredTutors: {
        type: Array,
        require: false
    }
});

module.exports = mongoose.model('student', studentSchema);