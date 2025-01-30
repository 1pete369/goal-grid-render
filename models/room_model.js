const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
  usersJoined: [String]
})

module.exports = mongoose.model("Room", roomSchema)