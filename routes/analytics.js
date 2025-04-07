const express = require("express")
const Task = require("../models/task_model")
const Goal = require("../models/goal_model")
const Habit = require("../models/habit_model")

const router = express.Router()


router.get("/:id", async (req, res) => {
  const uid = req.params.id
  try {
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

    // 🔹 Count Completed & Pending Today
    const numberOfTodayTasks = todayTasks?.length || 0
    const numberOfTodayCompletedTasks =
      todayTasks?.filter((task) => task.isCompleted)?.length || 0
    const numberOfTodayPendingTasks =
      numberOfTodayTasks - numberOfTodayCompletedTasks

    const todayTasksCompletionRate =
      numberOfTodayTasks > 0
        ? ((numberOfTodayCompletedTasks / numberOfTodayTasks) * 100).toFixed(2)
        : 0

    const goals = await Goal.find({ uid }).populate("habits")

    // 1️⃣ Overall Stats
    const totalGoals = goals.length
    const completedGoals = goals.filter(
      (goal) => goal.status === "completed"
    ).length

    const activeGoals = totalGoals - completedGoals
    const goalsCompletionRate =
      totalGoals > 0
        ? (
            goals.reduce(
              (sum, goal) => sum + (goal.progress?.completionRate || 0),
              0
            ) / totalGoals
          ).toFixed(2)
        : "0.00"

    // 2️⃣ Most Completed Goal
    const mostCompletedGoal = goals.reduce((maxGoal, goal) => {
      return (goal.progress?.completionRate || 0) >
        (maxGoal?.progress?.completionRate || 0)
        ? goal
        : maxGoal
    }, null)

    const mostCompletedGoalData = mostCompletedGoal
      ? {
          name: mostCompletedGoal.name,
          category: mostCompletedGoal.category,
          progress: mostCompletedGoal.progress
        }
      : null

    console.log("Most Completed Goal:", mostCompletedGoalData)

    const habits = await Habit.find({ uid, status: "active" })

    const today = new Date()
    const formattedDate = new Intl.DateTimeFormat("en-CA").format(today)

    console.log("Today's Date:", formattedDate)

    const completedHabitsToday = []

    const activeHabitsToday = habits.filter(
      (habit) => habit.status === "active"
    ).length

    for (const habit of habits) {
      if (
        habit.dailyTracking.has(formattedDate) &&
        habit.dailyTracking.get(formattedDate) === true
      ) {
        completedHabitsToday.push(habit.name)
      }
    }

    const completedHabitsTodayLength = completedHabitsToday.length
    const totalActiveHabitsLength = habits.length
    const completionHabitsRateToday =
      (completedHabitsTodayLength / totalActiveHabitsLength) * 100

    // Calculate streaks
    const highestCurrentStreak = Math.max(
      ...habits.map((habit) => habit.streak.current),
      0
    )

    res.json({
      numberOfTodayTasks,
      numberOfTodayCompletedTasks,
      numberOfTodayPendingTasks,
      todayTasksCompletionRate,
      totalGoals,
      completedGoals,
      activeGoals,
      goalsCompletionRate,
      highestCurrentStreak,
      activeHabitsToday,
      completionHabitsRateToday,
      completedHabitsTodayLength,mostCompletedGoalData
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    res.status(500).json({ message: "Error fetching data", error })
  }
})

// router.get("/basic/:id", async (req, res) => {
//   const uid = req.params.id

//   try {
//     res.json({ completedHabitsToday, habits, completionHabitsRateToday })
//   } catch (error) {
//     console.error("Error fetching habits:", error)
//     res.json({ message: "Error", error })
//   }
// })

module.exports = router
