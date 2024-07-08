import { Router } from "express";
import verifyToken from "../middleware/authencate.js";
import ChatRoom from "../models/chatRoom.js";

const router = Router();

router.route("/:ChatRoomId/send/:id").get(verifyToken, async (req, res) => {
  const { message } = req.body;
  const  senderId  = req.user.uid;
  const  receiverId  = req.params.id;
  const { chatId } = req.params.ChatRoomId;
  const { sendType } = req.user.type;
});

// creating the ChatRoom
router.route("/create/:id").get(verifyToken, async (req, res) => {
  const  senderId  = req.user.uid;
  const  receiverId  = req.params.id;
  const senderType  = req.user.type;

  console.log(req.user);

  console.log("senderType",senderType);

  let recevierType;

  if (senderId === "lender") {
    recevierType = "Borrower";
  } else {
    recevierType = "Lender";
  }

  console.log(recevierType);


  //check chatroom is created or not before
  const chatRoom = await ChatRoom.findOne({
    participants: {
      $all: [
        { $elemMatch: { userId: senderId, userType: senderType } },
        { $elemMatch: { userId: receiverId, userType: recevierType } }
      ]
    }
  });
    
    if(!chatRoom){
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
    }
    else{
        res.status(200).json(chatRoom);
        }
});

export default router;
