const mongoose = require("mongoose")

const goal = new mongoose.Schema({
  id: String,
  uid : String,
  name: String,
  description: String,
  category : String,
  createdAt : String,
  duration : Number,
  habits: [{ type: mongoose.Schema.Types.ObjectId, ref: "habit" }],
  progress: {
    totalCompleted : Number,
    completionRate: Number
  },
  status:String
})

module.exports = mongoose.model("goal", goal)
