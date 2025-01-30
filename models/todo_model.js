const mongoose = require("mongoose")

const todoSchema = new mongoose.Schema({
  id: String,
  uid: String,
  name: String,
  completed: Boolean,
  createdAt: String,
  categoryId: String
})


module.exports = mongoose.model("todos", todoSchema)