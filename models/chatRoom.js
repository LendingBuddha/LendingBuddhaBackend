import mongoose, { Schema } from "mongoose";

// ChatRoom Schema
const chatRoomSchema = new Schema(
  {
    participants: [
      {
        userId: {
          type: String,
          required: true,
          ref: "participants.userType",
        },
        userType: {
          type: String,
          enum: ["Lender", "Borrower"],
          required: true,
        },
        userName:{
          type:String,
          required:true
        }
       
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
export default ChatRoom
