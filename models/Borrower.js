const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BorrowerSchema = new Schema({

    fullname: { type: String, required: true, },
    email: { type: String, required: true, },
    phoneNumber: { type: String, required: true },
    panCard: { type: String, required: true, unique: true },
    aadharCard: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    password: { type: String, required: true, select: false },
    profilePic: { type: String, default: "" },

}, { timestamps: true });

module.exports = mongoose.model('Borrower', BorrowerSchema);

