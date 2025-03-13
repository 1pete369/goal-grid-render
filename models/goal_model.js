const mongoose = require("mongoose")

const goal = new mongoose.Schema({
  id: String,
  uid : String,
  name: String,
  description: String,
  category : String,
  goalColor : String,
  createdAt : String,
  duration: String,
  deadline : String,
  habits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Habit" }],
  progress: {
    totalCompleted : Number,
    completionRate: Number
  },
  status:String
})

module.exports = mongoose.model("goal", goal)
