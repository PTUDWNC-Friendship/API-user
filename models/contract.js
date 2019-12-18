const mongoose = require('mongoose');

const contractSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    _idStudent: mongoose.Schema.Types.ObjectId,
    _idTutor: mongoose.Schema.Types.ObjectId,
    _idSubject: mongoose.Schema.Types.ObjectId,
    startDate: Date,
    endDate: Date,
    createdDate: Date,
    policy: String,
    hoursNumber: Number,
    totalPrice: Number,
    revenue: Number,
    message: String,
    status: String
});

module.exports = mongoose.model('contract', contractSchema);
