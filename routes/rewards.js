const express = require("express")
const router = express.Router()
const User = require("../models/user_model") // Adjust path as needed
const Task = require("../models/task_model")
const Habit = require("../models/habit_model")
const Note = require("../models/note_model")
const Journal = require("../models/journal_model")

router.get("/get-daily-rewards-status/:id", async (req, res) => {
  const uid = req.params.id // Getting the user ID from the URL parameter
  try {

    const todayStr = new Date().toISOString().split("T")[0]

    // Fetching the user's rewards information from the database
    const userData = await User.findOne(
      { uid: uid },
      { "progress.dailyRewardsClaimed": 1 }
    )
    if (!userData) {
      return res.status(404).json({ error: "User not found" })
    }

    const todayRewards =
      userData?.progress?.dailyRewardsClaimed?.filter((reward) => {
        return reward.date.toISOString().split("T")[0] === todayStr
      }) || []

    console.log("Today's Rewards:", todayRewards)
    // Get the start and end of today
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0) // ⏳ Midnight (Start of the day)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999) // ⏳ 11:59 PM (End of the day)

    const todayTasks =
      (await Task.find({
        uid,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      })) || []

    const numberOfCompletedTasks =
      todayTasks?.filter((task) => task.isCompleted)?.length || 0


    console.log("todaystr", todayStr)

    // Fetch all habits for the user
    const habits = await Habit.find({ uid, status: "active" })

    const numberOfCompletedHabits = habits.filter(
      (habit) =>
        habit.dailyTracking && habit.dailyTracking.get(todayStr) === true
    ).length
    console.log("Number of Completed Habits:", numberOfCompletedHabits)

    // Fetch all journals for the user
    const notes = await Note.find({ uid })

    // Count notes created today
    const todayNotesCount = notes.filter(
      (note) => note.createdDate === todayStr
    ).length

    console.log("notes created today:", todayNotesCount)

    // Fetch all journals for the user
    const journals = await Journal.find({ uid })

    // Count journals created today
    const todayJournalsCount = journals.filter(
      (journal) => journal.createdDate === todayStr
    ).length

    console.log("Journals created today:", todayJournalsCount)

    // Returning the rewards claimed data
    res.status(200).json({
      rewardsClaimed: todayRewards,
      numberOfCompletedTasks,
      numberOfCompletedHabits,
      todayNotesCount,
      todayJournalsCount
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/rewards/claim
router.post("/claim", async (req, res) => {
  try {
    // Destructure expected data from the request body
    const { userId, reward, tokens } = req.body

    console.log("userId", userId)
    console.log("reward", reward)
    console.log("tokens", tokens)

    // Validate input (you can add more robust validation as needed)
    if (!userId || !reward || typeof tokens !== "number") {
      return res.status(400).json({ message: "Invalid request data" })
    }

    // Find the user by ID
    const user = await User.findOne({ uid: userId })
    if (!user) return res.status(404).json({ message: "User not found" })

    // Format today's date in YYYY-MM-DD
    const todayStr = new Date().toISOString().split("T")[0]

    // Check if there's an entry for today in dailyRewardsClaimed
    let dailyEntry = user.progress.dailyRewardsClaimed.find((entry) => {
      return new Date(entry.date).toISOString().split("T")[0] === todayStr
    })

    // If there's no entry for today, create one
    if (!dailyEntry) {
      dailyEntry = { date: new Date(), rewards: [] }
      user.progress.dailyRewardsClaimed.push(dailyEntry)
    }

    // Check if the reward is already claimed today
    if (dailyEntry.rewards.includes(reward)) {
      return res.status(400).json({ message: "Reward already claimed today" })
    }

    // Otherwise, add the reward to today's claimed rewards
    dailyEntry.rewards.push(reward)

    // Add tokens to the user's progress tokens field
    // (adjust this if tokens are stored somewhere else in your schema)
    user.progress.tokens += tokens

    // Save the user document
    await user.save()

    return res.json({
      message: "Reward claimed successfully",
      tokens: user.progress.tokens
    })
  } catch (error) {
    console.error("Error claiming reward:", error)
    return res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
