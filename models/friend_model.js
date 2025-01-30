const mongoose = require("mongoose")

const friend = new mongoose.Schema({
  id: String,
  recipientId: String,
  requesterId: String,
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "blocked"],
    default: "pending"
  },
  createdAt: String
})

module.exports = mongoose.model("Friend", friend)
