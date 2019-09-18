const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    url: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    image: { type: String }
});

module.exports = mongoose.model('User', userSchema);