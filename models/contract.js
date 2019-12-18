const mongoose = require('mongoose');

const contractSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    _idStudent: mongoose.Schema.Types.ObjectId,
    _idTutor: mongoose.Schema.Types.ObjectId,
    _idSubject: mongoose.Schema.Types.ObjectId,
    startDate: Date,
    endDate: Date,
    createdDate: Date,
    hoursNumber: Number,
    policy: String,
    totalPrice: Number,
    revenue: Number,
    message: String,
    status: Array
});

module.exports = mongoose.model('contract', contractSchema);