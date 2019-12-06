const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        require: true
    }
});

module.exports = mongoose.model('tag', tagSchema);