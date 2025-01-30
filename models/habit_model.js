const mongoose = require("mongoose")

const habit = new mongoose.Schema({
    uid : String,
    id: String,
    name: String,
    description: String,
    category: String,
    startDate: String,
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
    linkedGoal : String
})

module.exports = mongoose.model("habit",habit)