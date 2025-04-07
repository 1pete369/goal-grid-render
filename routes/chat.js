const express = require("express")
const router = express.Router()
const Chat = require("../models/chat_model") // Import your Chat model

// POST route to send a message and store it in MongoDB
router.post("/sendMessage", async (req, res) => {
  const { uid, message, roomName, type, mediaUrl, mediaType } = req.body

  try {
    const newMessage = new Chat({
      uid,
      message,
      roomName,
      type,
      mediaUrl: mediaUrl || "", // If no mediaUrl is provided, store an empty string
      mediaType: mediaType || "none", // If no mediaType is provided, default to 'none'
      createdAt: new Date().toISOString() // Timestamp for the message
    })

    // Save the message to the database
    await newMessage.save()

    // Send success response
    return res
      .status(201)
      .json({ message: "Message sent successfully", data: newMessage })
  } catch (error) {
    console.error("Error saving message:", error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

router.get("/get-messages/:id", async (req, res) => {
  console.log("Get messages called",req.params.id)
  try {
    const  roomName  = req.params.id
    const messages = await Chat.find({ roomName }).sort({ createdAt: 1 })

    console.log("Messages",messages)
    if(messages.length>0){
      return res.status(200).json({ message: "Messages fetched", data: messages })
    }else{
      return res.status(200).json({ message: "Messages not fetched", data: messages })
    }
  } catch (error) {
    console.error("Error fetching messages:", error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

module.exports = router
