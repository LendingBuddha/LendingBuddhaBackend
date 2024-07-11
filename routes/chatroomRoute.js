import express from 'express';
import ChatRoom from '../models/chatRoom.js';

const router = express.Router();

// Route to get all chat rooms for a specific user ID
router.get('/chatrooms/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const chatRooms = await ChatRoom.find({
      'participants.userId': userId
    }).populate('messages');

    res.status(200).json(chatRooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat rooms', error });
  }
});

export default router;
