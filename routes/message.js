import { Router } from "express";
import verifyToken from "../middleware/authencate.js";
import ChatRoom from "../models/chatRoom.js";
import { ChatMessage } from "../models/chatMessage.js";
import { Lender } from "../models/Lender.js";
import { Borrower } from "../models/Borrower.js";

const router = Router();

//Send Messages
router.route("/message/send/:roomId").post(verifyToken, async (req, res) => {
  const senderId = req.user.uid;
  const senderType = req.user.type;
  const { message } = req.body;
  const { roomId } = req.params;

  try {
    // Find the chat room
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return res.status(404).json({ error: "ChatRoom not found" });
    }

    // Determine receiver type based on sender type
    let receiverType;
    if (senderType === "Lender") {
      receiverType = "Borrower";
    } else {
      receiverType = "Lender";
    }



    // Assume the receiver is the other participant
    const receiver = chatRoom.participants.find(
      (participant) => participant.userType === receiverType
    );
    if (!receiver) {
      return res
        .status(400)
        .json({ error: "Receiver not found in the chat room" });
    }
    const receiverId = receiver.userId;

    // Create a new message
    const newMessage = new ChatMessage({
      chatRoom: roomId,
      senderId: senderId,
      receiverId: receiverId,
      senderType: senderType,
      recevierType: receiverType,
      message: message,
      timestamp: new Date(),
    });

    // Save the new message
    const savedMessage = await newMessage.save();

    // Add the message to the chat room
    chatRoom.messages.push(savedMessage._id);
    await chatRoom.save();

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: error.message });
  }
});

// Receive Messages
router.route("/message/:roomId").get(async (req, res) => {
  try {
    const { roomId } = req.params;
    //   const senderId = req.user.uid;
    //   const senderType = req.user.type
    //   const receiverType = req.user.type === "Lender" ? "Borrower" : "Lender";

    const conversation = await ChatRoom.findById(roomId).populate("messages");

    if (!conversation) return res.status(200).json([]);

    return res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("Error in ReceiveMessage", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// creating the ChatRoom
router.route("/create/:id").get(verifyToken, async (req, res) => {
  const senderId = req.user.uid;
  const receiverId = req.params.id;
  const senderType = req.user.type;

  console.log(req.user);

  console.log("senderType", senderType);

  let recevierType;

  if (senderType === "lender") {
    recevierType = "Borrower";
  } else {
    recevierType = "Lender";
  }

  console.log(recevierType);

  const senderModel = senderType === 'lender' ? Lender : Borrower;
  const reciverModel = recevierType === 'lender' ? Lender : Borrower;

  const sender=await senderModel.findById(senderId);
  const reciver=await reciverModel.findById(receiverId);

  if(!sender || !reciver){
       return res.status(404).json({message : "User Not Found"})
  }
   
  const senderName=sender.fullname;
  const reciverName=reciver.fullname;


  //check chatroom is created or not before
  const chatRoom = await ChatRoom.findOne({
    participants: {
      $all: [
        { $elemMatch: { userId: senderId, userType: senderType,userName:senderName } },
        { $elemMatch: { userId: receiverId, userType: recevierType ,userName:reciverName} },
      ],
    },
  });

  if (!chatRoom) {
    const newChatRoom = new ChatRoom({
      participants: [
        { userId: senderId, userType: senderType },
        { userId: receiverId, userType: recevierType },
      ],
      messages: [], // Initially, there are no messages
    });

    // Save the ChatRoom to the database
    await newChatRoom
      .save()
      .then((savedChatRoom) => {
        console.log("ChatRoom created and saved:", savedChatRoom);
        res.status(200).json(savedChatRoom);
      })
      .catch((error) => {
        console.error("Error saving ChatRoom:", error.message);
      });
  } else {
    res.status(200).json(chatRoom);
  }
});

export default router;
