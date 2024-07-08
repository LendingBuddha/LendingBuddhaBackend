import mongoose, { Schema } from "mongoose";

// ChatRoom Schema
const chatRoomSchema = new Schema(
  {
    participants: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "participants.userType",
        },
        userType: {
          type: String,
          enum: ["Lender", "Borrower"],
          required: true,
        },
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "ChatMessage",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
module.exports = ChatRoom;
