const mongoose = require("mongoose")

const habit = new mongoose.Schema({
    uid : String,
    id: String,
    name: String,
    description: String,
    category: String,
    startDate: String,
    endDate: String,
    habitColor:String,
    duration: String,
    streak: {
      current: Number,
      best: Number
    },
    progress: {
      totalCompleted: Number,
      completionRate: Number
    },
    dailyTracking: {
        type: Map,
        of: Boolean
    },
    status: String,
    linkedGoal : String,
    createdAt :  { type: Date, default: Date.now } 
})

module.exports = mongoose.model("Habit",habit)