const mongoose = require("mongoose")

const user = new mongoose.Schema({
  uid: String,
  personalInfo: {
    email: String,
    name: String,
    username: String,
    photoURL: String,
    provider: String,
    isEmailVerified: Boolean,
    dob: String,
    profession: String,
    intendedUseCases: [String],
    referralSource: String,
    gender: String
  },
  isOnboardingComplete: Boolean,
  customData: {
    timezone: {
      timezoneName: String,
      countryCode: String
    },
    preferences: {
      notification: Boolean
    },
    streak: Number,
    goals: [{ type: mongoose.Schema.Types.ObjectId, ref: "goals" }],
    habits: [{ type: mongoose.Schema.Types.ObjectId, ref: "habits" }],
    days: [{ type: mongoose.Schema.Types.ObjectId, ref: "days" }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "Friend" }],
    taskCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "categories" }
    ],
    subscription: String
  },
  updates: {
    profileUpdatedAt: Date
  },
  timings: {
    createdAt: String,
    lastLoginAt: String
  },
})

module.exports = mongoose.model("users", user)
