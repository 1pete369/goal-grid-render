const mongoose = require("mongoose")

const ChatSchema = new mongoose.Schema({
  id: String,
  uid: String,
  message: String,
  mediaUrl: String,
  mediaType: { type: String, enum: ["image", "video", "none"] },
  createdAt: String,
  roomName: String,
  type: { type: String, enum: ["public", "private"] }
})

module.exports = mongoose.model("Chat", ChatSchema)
