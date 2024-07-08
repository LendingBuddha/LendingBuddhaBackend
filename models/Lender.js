const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LenderSchema = new Schema({

    fullname: { type: String, required: true },
    email: { type: String, required: true, },
    phoneNumber: { type: String, required: true },
    panCard: { type: String, required: true, unique: true },
    aadharCard: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    profilePic: { type: String, default: "" },
    chatRooms: [{  type: Schema.Types.ObjectId,ref: 'ChatRoom'  }],
    


}, { timestamps: true });

module.exports = mongoose.model('Lender', LenderSchema);