const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LenderSchema = new Schema({
    fullname:{type:String,required:true},

    email:{type:String, required:true,},
    
    phoneNumber: { type: String, required: true },
    
    panCard: { type: String, required: true, unique: true },
    aadharCard: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    password: { type: String, required: true, select: false }, 

}, { timestamps: true });

module.exports = mongoose.model('Lender', LenderSchema);