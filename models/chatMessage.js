const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ChatMessage Schema
const chatMessageSchema = new Schema({
  chatRoom: { 
    type: Schema.Types.ObjectId, 
    ref: 'ChatRoom', 
    required: true 
  },
  senderId: { 
    type: Schema.Types.ObjectId, 
    refPath: 'senderModel', 
    required: true 
  },
  senderType: {
    type: String,
    enum: ['Lender', 'Borrower'], // Determines whether the sender is a Lender or Borrower
    required: true
  },
  receiverId: { 
    type: Schema.Types.ObjectId, 
    refPath: 'senderModel', 
    required: true 
  },
  recevierType: {
    type: String,
    enum: ['Lender', 'Borrower'], // Determines whether the reciever is a Lender or Borrower
    required: true
  },
  message: { 
    type: String, 
    required: true 
  },
  
},{ timestamps: true });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
module.exports = ChatMessage;
