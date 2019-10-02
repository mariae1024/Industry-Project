const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    jobName: { type: String, required: true },
    jobType: { type: String, required: true },
    description: { type: String },
    payment: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    uploadFile: { type: String },
    internalQuote: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, required: true }
});

module.exports = mongoose.model('Job', jobSchema);