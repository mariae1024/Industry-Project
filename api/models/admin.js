const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model('Admin', adminSchema);