const mongoose = require("mongoose")
const taskSchema = new mongoose.Schema({
  id: String,
  uid: String,
  name: String,
  description: String,
  duration: String,
  priority: { type: String, enum: ["1", "2", "3", "4"] },
  category: String,
  startTime : String,
  isCompleted: Boolean,
  createdAt: { type: Date, default: Date.now },
  taskColor: String,
  completedAt : { type: Date, default: null }
})

module.exports = mongoose.model("Task", taskSchema)
