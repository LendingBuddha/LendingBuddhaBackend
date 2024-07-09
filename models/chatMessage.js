import mongoose, { Schema } from "mongoose";

// ChatMessage Schema
const chatMessageSchema = new Schema(
  {
    chatRoom: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    senderId: {
      type: String,
      refPath: "senderType",
      required: true,
    },
    senderType: {
      type: String,
      enum: ["Lender", "Borrower"], // Determines whether the sender is a Lender or Borrower
      required: true,
    },
    receiverId: {
      type: String,
      refPath: "recevierType",
      required: true,
    },
    recevierType: {
      type: String,
      enum: ["Lender", "Borrower"], // Determines whether the reciever is a Lender or Borrower
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export { ChatMessage };
