const express = require("express")
const router = express.Router()

const Habit = require("../models/habit_model")

// Root route (can be removed if unnecessary)
router.get("/", (req, res) => {
  res.status(200).json({ message: "in habit route" })
})

router.get("/get-resource-count/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const resourceCount = await Habit.countDocuments({ uid })
    if (resourceCount > 0) {
      res.status(200).json({ resourceCount })
    } else {
      res.status(200).json({ resourceCount: 0 })
    }
  } catch (error) {
    res.json(500).json({ error: "Internal server error" })
  }
})

// Fetch habits for a user
router.get("/get-habits/:id", async (req, res) => {
  const { id } = req.params
  try {
    const habits = await Habit.find({ uid: id })
    if (habits.length === 0)
      return res.status(200).json({ message: "No habits found", data: [] })
    res.status(200).json({ message: "Habits Fetched", data: habits })
  } catch (error) {
    res.status(500).json({ message: "Error Occurred", error })
  }
})

// Create a new habit
router.post("/create-habit", async (req, res) => {
  const { habit } = req.body
  try {
    const habitCreated = new Habit(habit)
    await habitCreated.save()
    res.status(201).json({ message: "Habit Created", data: habitCreated })
  } catch (error) {
    res.status(500).json({ message: "Error Occurred", error })
  }
})

// Delete a habit
router.delete("/delete-habit/:id", async (req, res) => {
  const id = req.params.id
  try {
    const deletedHabit = await Habit.findOneAndDelete({ id })
    if (!deletedHabit) {
      return res.status(404).json({ message: "Habit not found" })
    }
    res.status(200).json({ message: "Habit deleted", data: deletedHabit })
  } catch (error) {
    res.status(500).json({ message: "Error Occurred", error })
  }
})
// Delete multiple linked habits
router.delete("/delete-linked-habits", async (req, res) => {
  const { habitIds } = req.body

  if (!habitIds || habitIds.length === 0) {
    return res.status(400).json({ message: "No habit IDs provided" })
  }

  try {
    const deletedHabits = await Habit.deleteMany({ id: { $in: habitIds } })

    if (deletedHabits.deletedCount === 0) {
      return res.status(404).json({ message: "No habits found to delete" })
    }

    res
      .status(200)
      .json({ message: "Linked habits deleted", data: deletedHabits })
  } catch (error) {
    res.status(500).json({ message: "Error Occurred", error })
  }
})

module.exports = router

// Update habit status
router.patch("/update-habit-status/:id", async (req, res) => {
  const { id } = req.params
  const updatedHabit = req.body.habit

  try {
    const habitUpdated = await Habit.findOneAndUpdate(
      { id, uid: updatedHabit.uid },
      {
        $set: {
          streak: updatedHabit.streak,
          progress: updatedHabit.progress,
          dailyTracking: updatedHabit.dailyTracking,
          status: updatedHabit.status
        }
      },
      { new: true }
    )

    if (!habitUpdated) {
      return res.status(404).json({ message: "Habit not found" })
    }

    res
      .status(200)
      .json({ message: "Habit updated successfully", data: habitUpdated })
  } catch (error) {
    res.status(500).json({ message: "Error Occurred", error })
  }
})

// 📊 Get overall habit analytics
// 📊 Get overall habit analytics
// router.get("/analytics/habits/:id", async (req, res) => {

//   const uid= req.params.id

//   try {
//     const habits = await Habit.find({ uid }); // Get user's habits

//     const totalHabits = habits.length;
//     const completedHabits = habits.filter(h => h.status === "completed").length;
//     const activeHabits = habits.filter(h => h.status === "active").length;
//     const abandonedHabits = totalHabits - (completedHabits + activeHabits);

//     let totalCompletedDays = 0;
//     let totalPossibleDays = 0;
//     let bestStreak = 0;
//     let totalStreaks = 0;

//     habits.forEach(habit => {
//       totalCompletedDays += habit.progress.totalCompleted;
//       totalPossibleDays += Object.keys(habit.dailyTracking).length; // Count total days tracked
//       bestStreak = Math.max(bestStreak, habit.streak.best);
//       totalStreaks += habit.streak.best;
//     });

//     const overallCompletionRate = totalPossibleDays > 0 ? (totalCompletedDays / totalPossibleDays) * 100 : 0;
//     const averageStreak = totalHabits > 0 ? (totalStreaks / totalHabits) : 0;

//     res.json({
//       totalHabits,
//       completedHabits,
//       activeHabits,
//       abandonedHabits,
//       overallCompletionRate: parseFloat(overallCompletionRate.toFixed(2)), // Keep it clean
//       bestStreak,
//       averageStreak: parseFloat(averageStreak.toFixed(2)) // Keep it clean
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// });
router.get("/analytics/:id", async (req, res) => {
  const uid = req.params.id

  try {
    const habits = await Habit.find({ uid })

    console.log("Fetched habits:", habits) // Debugging

    const totalHabits = habits.length
    const completedHabits = habits.filter(
      (habit) => habit.status === "completed"
    ).length
    const activeHabits = habits.filter(
      (habit) => habit.status === "active"
    ).length
    
    const completionRate =
      totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

    // 🔥 FIX: Handle missing `streak` safely
    const highestCurrentStreak = Math.max(
      ...habits.map((habit) => habit.streak?.current || 0),
      0
    )
    
    const highestCurrentStreakHabitNames = habits
      .filter((habit) => (habit.streak?.current || 0) === highestCurrentStreak)
      .map((habit) => habit.name)

    const highestBestStreak = Math.max(
      ...habits.map((habit) => habit.streak?.best || 0),
      0
    )
    const highestBestStreakHabitNames = habits
      .filter((habit) => (habit.streak?.best || 0) === highestBestStreak)
      .map((habit) => habit.name)

    const highestCurrentStreakHabitName =
      highestCurrentStreakHabitNames.length > 0
        ? highestCurrentStreakHabitNames.join(", ")
        : "None"
    const highestBestStreakHabitName =
      highestBestStreakHabitNames.length > 0
        ? highestBestStreakHabitNames.join(", ")
        : "None"

    // 🔥 FIX: Handle missing `progress` safely
    const mostCompletedHabit = habits.reduce((maxHabit, habit) => {
      return (habit.progress?.totalCompleted || 0) >
        (maxHabit.progress?.totalCompleted || 0)
        ? habit
        : maxHabit
    }, {})

    const mostCompletedHabitName = mostCompletedHabit.name || "None"
    const mostCompletedHabitCount =
      mostCompletedHabit.progress?.totalCompleted || 0

    const leastCompletedHabit = habits.reduce((minHabit, habit) => {
      return (habit.progress?.totalCompleted || Infinity) <
        (minHabit.progress?.totalCompleted || Infinity)
        ? habit
        : minHabit
    }, {})

    const leastCompletedHabitName = leastCompletedHabit.name || "None"
    const leastCompletedHabitCount =
      leastCompletedHabit.progress?.totalCompleted || 0

    // 🔥 FIX: Handle `dailyTracking` safely
    let mostMissedHabit = { name: "None", missedDays: 0 }
    habits.forEach((habit) => {
      if (habit.dailyTracking) {
        let missedDays = 0
        const trackingData =
          habit.dailyTracking instanceof Map
            ? Object.fromEntries(habit.dailyTracking)
            : habit.dailyTracking || {} // Default to empty object

        missedDays = Object.values(trackingData).filter(
          (value) => value === false
        ).length
        if (missedDays > mostMissedHabit.missedDays) {
          mostMissedHabit = { name: habit.name, missedDays }
        }
      }
    })

    const mostMissedHabitName =
      mostMissedHabit.missedDays > 0 ? mostMissedHabit.name : "None"
    const mostMissedHabitCount = mostMissedHabit.missedDays

    // 🔥 FIX: Avoid undefined `habit._id`
    let dailyCompletion = {}
    let dailyActiveHabits = {}
    let activeHabitsToLoop = habits.filter((habit) => habit.status === "active")

    activeHabitsToLoop.forEach((habit) => {
      let habitStartDate = habit.createdAt
        ? new Date(habit.createdAt).toISOString().split("T")[0]
        : null

      if (habit.dailyTracking) {
        const trackingData =
          habit.dailyTracking instanceof Map
            ? Object.fromEntries(habit.dailyTracking)
            : habit.dailyTracking || {} // Default to empty object

        Object.keys(trackingData).forEach((date) => {
          if (!dailyCompletion[date]) {
            dailyCompletion[date] = {
              completed: 0,
              totalActive: 0,
              completionRate: "0%"
            }
          }
          if (!dailyActiveHabits[date]) {
            dailyActiveHabits[date] = new Set()
          }

          if (habit._id) {
            dailyActiveHabits[date].add(habit._id) // ✅ Ensures `_id` is valid
          }

          if (trackingData[date]) {
            dailyCompletion[date].completed++
          }
        })

        if (habitStartDate) {
          let currentDate = new Date(habitStartDate)
          let today = new Date()

          while (currentDate <= today) {
            let dateStr = currentDate.toISOString().split("T")[0]

            if (!dailyActiveHabits[dateStr]) {
              dailyActiveHabits[dateStr] = new Set()
            }
            if (habit._id) {
              dailyActiveHabits[dateStr].add(habit._id)
            }

            currentDate.setDate(currentDate.getDate() + 1)
          }
        }
      }
    })

    Object.keys(dailyActiveHabits).forEach((date) => {
      if (!dailyCompletion[date]) {
        dailyCompletion[date] = {
          completed: 0,
          totalActive: 0,
          completionRate: "0%"
        }
      }
      dailyCompletion[date].totalActive = dailyActiveHabits[date].size
    })

    Object.keys(dailyCompletion).forEach((date) => {
      let data = dailyCompletion[date]
      if (data.totalActive > 0) {
        data.completionRate = (
          (data.completed / data.totalActive) *
          100
        ).toFixed(2)
      }
    })

    console.log(dailyCompletion)

    res.json({
      totalHabits,
      completedHabits,
      activeHabits,
      completionRate,
      highestCurrentStreak,
      highestCurrentStreakHabitName,
      highestBestStreak,
      highestBestStreakHabitName,
      mostCompletedHabitName,
      mostCompletedHabitCount,
      leastCompletedHabitName,
      leastCompletedHabitCount,
      mostMissedHabitName,
      mostMissedHabitCount,
      dailyCompletion
    })
  } catch (error) {
    console.error("Error in analytics route:", error) // 🔥 Now logs the error in console
    res.status(500).json({ message: "Internal server error", error })
  }
})

// router.get("/new-analytics/:id", async (req, res) => {
//   try {
//     console.log("came")

//     const uid = req.params.id

//     const basicStats = await Habit.aggregate([
//       { $match: { uid } },
//       {
//         $group: {
//           _id: null,
//           totalHabits: { $sum: 1 },
//           completedHabits: {
//             $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
//           },
//           activeHabits: {
//             $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0, // Exclude _id from the final output
//           totalHabits: 1, // Show totalHabits
//           completedHabits: 1, // Show completedHabits
//           activeHabits: 1, // Show activeHabits
//           completionRate: {
//             $round: [
//               {
//                 $cond: [
//                   { $gt: ["$totalHabits", 0] },
//                   {
//                     $multiply: [
//                       { $divide: ["$completedHabits", "$totalHabits"] },
//                       100
//                     ]
//                   },
//                   0
//                 ]
//               },
//               0 // Round to 0 decimal places
//             ]
//           }
//         }
//       }
//     ])

//     const streaks = await Habit.aggregate([
//       { $match: { uid } },
//       {
//         $group: {
//           _id: null,
//           highestCurrentStreak: { $max: "$streak.current" },
//           highestBestStreak: { $max: "$streak.best" }
//         }
//       }
//     ])

//     const highestCurrentStreakHabit = await Habit.findOne(
//       {
//         uid: req.params.id,
//         "streak.current": streaks[0]?.highestCurrentStreak
//       },
//       { name: 1 }
//     )

//     const highestBestStreakHabit = await Habit.findOne(
//       {
//         uid: req.params.id,
//         "streak.best": streaks[0]?.highestBestStreak
//       },
//       { name: 1 }
//     )

//     const mostCompletedHabit = await Habit.findOne(
//       {
//         uid
//       },
//       {
//         name: 1,
//         "progress.totalCompleted": 1
//       },
//       { $sort: { "progress.totalCompleted": -1 } }
//     )

//     const leastCompletedHabit = await Habit.findOne(
//       { uid },
//       { name: 1, "progress.totalCompleted": 1 },
//       { sort: { "progress.totalCompleted": 1 } } // Sort by lowest completion
//     )

//     res.json({ basicStats, highestCurrentStreakHabit, highestBestStreakHabit })
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error })
//   }
// })

module.exports = router
