const Chat = require("../models/chat_model");

const getMessages = async (req, res) => {
  try {
    const { roomName } = req.query;
    const messages = await Chat.find({ roomName }).sort({ createdAt: 1 });

    return res.status(200).json({ message: "Messages fetched", data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getMessages };
