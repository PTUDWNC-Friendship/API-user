const mongoose = require('mongoose');

const tagSubjectSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    _idTag: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    _idSubject: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    }
});

module.exports = mongoose.model('tag_subject', tagSubjectSchema);