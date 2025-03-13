const Task = require("../models/task_model")
const express = require("express")
const router = express.Router()

router.post("/create-task", async (req, res) => {
  const { task } = req.body

  if (!task) {
    return res.status(400).json({ message: "Task Missing" })
  }

  try {
    const newTask = new Task(task)
    await newTask.save()
    return res.status(201).json({ message: "Task Created", task: newTask })
  } catch (error) {
    console.error("Error creating task:", error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

// ✅ Get tasks by User ID
router.get("/get-tasks/:uid", async (req, res) => {
  const { uid } = req.params

  if (!uid) {
    return res.status(400).json({ message: "UserId Missing" })
  }

  try {
    // Get the start and end of today
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0) // ⏳ Midnight (Start of the day)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999) // ⏳ 11:59 PM (End of the day)

    // Fetch only tasks created today
    const tasks = await Task.find({
      uid: uid
      // ,
      // createdAt: {
      //   $gte: startOfDay, // ⏳ Created **after** midnight today
      //   $lte: endOfDay // ⏳ Created **before** 11:59 PM today
      // }
    })

    return res.status(200).json({ tasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

router.patch("/toggle-task/:taskId", async (req, res) => {
  const { taskId } = req.params
  const { completedStatus } = req.body
  console.log("At server toggle task", taskId, completedStatus)

  if (!taskId) {
    return res.status(400).json({ message: "TaskId is missing" })
  }

  try {
    const updatedTask = await Task.findOneAndUpdate(
      { id: taskId },
      {
        $set: {
          isCompleted: completedStatus,
          completedAt: completedStatus ? new Date() : null // ⏳ Set timestamp or reset
        }
      },
      { new: true }
    )

    console.log("At server toggle task", updatedTask)

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" })
    }

    return res.status(200).json({ message: "Task updated", data: updatedTask })
  } catch (error) {
    console.error("Error updating task:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
})

// ✅ Delete a Task
router.delete("/delete-task/:taskId", async (req, res) => {
  const { taskId } = req.params

  if (!taskId) {
    return res.status(400).json({ message: "TaskId is missing" })
  }

  try {
    const deletedTask = await Task.findOneAndDelete({ id: taskId })

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" })
    }

    return res.status(200).json({ message: "Task deleted", data: deletedTask })
  } catch (error) {
    console.error("Error deleting task:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
})

router.get("/get-resource-count/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const resourceCount = await Task.countDocuments({ uid })
    if (resourceCount > 0) {
      res.status(200).json({ resourceCount })
    } else {
      res.status(200).json({ resourceCount: 0 })
    }
  } catch (error) {
    res.json(500).json({ error: "Internal server error" })
  }
})

// Task Analytics
router.get("/analytics/:id", async (req, res) => {
  try {
    const uid = req.params.id

    // Get the start and end of today
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0) // ⏳ Midnight (Start of the day)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999) // ⏳ 11:59 PM (End of the day)

    // 🔹 Get All Tasks for the User
    const tasks = (await Task.find({ uid })) || [] // If no tasks exist, return an empty array

    // 🔹 Count Completed and Pending Tasks
    const numberOfTasks = tasks?.length || 0
    const numberOfCompletedTasks =
      tasks?.filter((task) => task.isCompleted)?.length || 0
    const numberOfPendingTasks = numberOfTasks - numberOfCompletedTasks

    // 🔹 Get Today's Tasks
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

    // completion rate
    const totalCompletionRate =
      numberOfTasks > 0
        ? ((numberOfCompletedTasks / numberOfTasks) * 100).toFixed(2)
        : 0

    const todayCompletionRate =
      numberOfTodayTasks > 0
        ? ((numberOfTodayCompletedTasks / numberOfTodayTasks) * 100).toFixed(2)
        : 0

    const taskAnalytics = await Task.aggregate([
      { $match: { uid } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    const dailyTaskStats = taskAnalytics.map((day) => ({
      date: day._id,
      totalTasks: day.totalTasks,
      completedTasks: day.completedTasks
    }))

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Set time to 00:00:00
    
    const dropOffData = await Task.aggregate([
      { 
        $match: { 
          uid, 
          isCompleted: false, 
          createdAt: { $lt: todayStart } // Exclude today's tasks
        } 
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // Group by weekday
          missedTasks: { $sum: 1 } // Count only missed tasks
        }
      },
      { $sort: { _id: 1 } }
    ]);
    


    const timedData = await Task.aggregate([
      { $match: { uid, isCompleted: true } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%H",
              date: "$completedAt"
            }
          },
          completedTasks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // const completedDaysForStreak =

    const completedDates = await Task.aggregate([
      { $match: { uid, isCompleted: true } }, // Only completed tasks
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by date (oldest to newest)
    ])

    const calculateStreaks = (completedDates) => {
      let currentStreak = 0
      let bestStreak = 0
      let lastDate = null

      completedDates.forEach((entry) => {
        const currentDate = new Date(entry._id)

        if (lastDate) {
          const difference = (currentDate - lastDate) / (1000 * 60 * 60 * 24) // Days difference

          if (difference === 1) {
            currentStreak++ // Continue streak
          } else {
            bestStreak = Math.max(bestStreak, currentStreak)
            currentStreak = 1 // Streak resets
          }
        } else {
          currentStreak = 1 // First day starts a streak
        }

        lastDate = currentDate
      })

      bestStreak = Math.max(bestStreak, currentStreak) // Final best streak check
      return { currentStreak, bestStreak }
    }

    // Calculate streaks
    const { currentStreak, bestStreak } = calculateStreaks(completedDates)

    console.log(
      "🔥 Current Streak:",
      currentStreak,
      "🔥 Best Streak:",
      bestStreak
    )
    
    const priorityAnalytics = await Task.aggregate([
      { $match: { uid } },
      {
        $group: {
          _id: "$priority",
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] }
          },
          missedTasks: {
            $sum: { 
              $cond: [ 
                { 
                  $and: [
                    { $eq: ["$isCompleted", false] }, 
                    { $lt: ["$createdAt", todayStart] } // Only count past days' missed tasks
                  ] 
                }, 
                1, 
                0 
              ] 
            }
          }
        }
      },
      { $sort: { _id: 1 } } // Sort by priority level (1 to 4)
    ]);
    

    // const taskDurationAnalytics = await Task.aggregate([
    //   {$match : {uid, isCompleted : true, duration : {$ne : null}}},
    //   {$group : {
    //     _id :{ $dateToString : { format : "%Y-%m-%d" , date: "$completedAt" }},
    //     averageDuration : {$avg: {$toInt : "$duration"}},
    //     totalDuration : {$sum: { $toInt: "$duration" } }
    //   }},
    //   {$sort : {_id : 1}}
    // ])

    const overallTaskDurationAnalytics = await Task.aggregate([
      { $match: { uid, duration: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          averageDuration: { $avg: { $toInt: "$duration" } },
          totalDuration: { $sum: { $toInt: "$duration" } },
          completedDuration: {
            $sum: {
              $cond: [
                { $eq: ["$isCompleted", true] },
                { $toInt: "$duration" },
                0
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ])

    res.json({
      numberOfTasks,
      numberOfCompletedTasks,
      numberOfPendingTasks,
      numberOfTodayTasks,
      numberOfTodayCompletedTasks,
      numberOfTodayPendingTasks,
      totalCompletionRate,
      todayCompletionRate,
      dailyTaskStats,
      dropOffData,
      timedData,
      currentStreak,
      bestStreak,
      priorityAnalytics,
      overallTaskDurationAnalytics
    })
  } catch (error) {
    console.error("Error fetching task analytics:", error)
    res.status(500).json({ message: "Internal Server Error" })
  }
})

module.exports = router
