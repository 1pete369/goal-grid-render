const express = require("express")
const mongoose = require("mongoose")
const goal = require("../models/goal_model")

const router = express.Router()

// Route for checking if the goal route is working
router.get("/", (req, res) => {
  res.status(200).json({ message: "In goal route" })
})

router.get("/get-resource-count/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const resourceCount = await goal.countDocuments({ uid })
    if (resourceCount > 0) {
      res.status(200).json({ resourceCount })
    } else {
      res.status(200).json({ resourceCount: 0 })
    }
  } catch (error) {
    res.json(500).json({ error: "Internal server error" })
  }
})

// Route for creating a new goal
router.post("/create-goal", async (req, res) => {
  const goalObject = req.body.goal
  try {
    const goalCreated = new goal(goalObject)
    await goalCreated.save()
    res.status(201).json({ message: "Goal Created", goalCreated })
  } catch (error) {
    res.status(500).json({ message: "Error Occurred", Error: error.message })
  }
})

// Route for fetching all goals of a user by user ID
router.get("/get-goals/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const goals = await goal.find({ uid }).populate({
      path: "habits"
    })
    res.status(200).json({ message: "Goals Fetched", goals })
  } catch (error) {
    res.status(500).json({ message: "Error Occurred", Error: error.message })
  }
})

// Route for fetching a specific goal by its ID
router.get("/get-goal/:id", async (req, res) => {
  const id = req.params.id
  console.log("Came to get goal", id)
  try {
    const goalFetched = await goal.findOne({ id })
    if (!goalFetched) {
      return res.status(404).json({ message: "Goal Not Found" })
    }
    res.status(200).json({ message: "Goal Fetched", goal: goalFetched })
  } catch (error) {
    res.status(500).json({ message: "Error Occurred", Error: error.message })
  }
})

// Route for linking a habit to a goal
router.patch("/link-habit/:id", async (req, res) => {
  const uid = req.params.id
  const { habitIdInDb, linkedGoalId } = req.body

  const habitObjectId = new mongoose.Types.ObjectId(habitIdInDb)
  try {
    const updatedGoal = await goal.findOneAndUpdate(
      { uid, id: linkedGoalId },
      {
        $push: { habits: habitObjectId }
      },
      { new: true }
    )
    if (!updatedGoal) {
      return res.status(404).json({ message: "Goal Not Found" })
    }
    res.status(200).json({ message: "Habit Linked Successfully", updatedGoal })
  } catch (error) {
    res.status(500).json({ message: "Error Occurred", Error: error.message })
  }
})

// Route for updating the progress of a goal
router.patch("/update-goal-status/:id", async (req, res) => {
  const id = req.params.id
  const goalObject = req.body.goal
  console.log("at update goal progress", goalObject)
  try {
    const updatedGoal = await goal.findOneAndUpdate(
      { id },
      {
        $set: { progress: goalObject.progress , status : goalObject.status}
      },
      { new: true }
    )
    if (!updatedGoal) {
      return res.status(404).json({ message: "Goal Not Found" })
    }
    console.log(updatedGoal)
    res.status(200).json({ message: "Goal Progress Updated", updatedGoal })
  } catch (error) {
    res.status(500).json({ message: "Error Occurred", Error: error.message })
  }
})

router.get("/analytics/:id", async (req, res) => {
  try {
    const uid = req.params.id;

    // Fetch all goals for the user
    const goals = await goal.find({ uid }).populate("habits");

    if (!goals.length) {
      return res.json({ message: "No goals found", data: {} });
    }

    // 1️⃣ Overall Stats
    const totalGoals = goals.length;
    const completedGoals = goals.filter((goal) => goal.status === "completed").length;
    const activeGoals = totalGoals - completedGoals;
    
    const completionRate =
      totalGoals > 0
        ? (
            goals.reduce((sum, goal) => sum + goal.progress.completionRate, 0) /
            totalGoals
          ).toFixed(2)
        : "0.00";

    // 2️⃣ Category-Wise Data
    const categoryStats = {}; // Stores category progress and count

    goals.forEach((goal) => {
      if (!categoryStats[goal.category]) {
        categoryStats[goal.category] = { totalProgress: 0, count: 0 };
      }
      categoryStats[goal.category].totalProgress += goal.progress.completionRate;
      categoryStats[goal.category].count++;
    });

    // 3️⃣ Convert to Array for Response
    const categoryPieChart = Object.entries(categoryStats).map(
      ([category, data]) => ({
        category,
        count: data.count,
        averageProgress: (data.totalProgress / data.count).toFixed(2), // Calculate overall progress
      })
    );

    // Final JSON response
    res.json({
      overallStats: {
        totalGoals,
        completedGoals,
        activeGoals,
        completionRate,
      },
      categoryPieChart,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.delete("/delete-goal/:id", async (req, res) => {
  const goalId = req.params.id

  if (!goalId) {
    return res.status(400).json({ message: "Goal ID is required" })
  }

  try {
    // Delete the linked habits
    // Delete the goal
    await goal.findOneAndDelete({ id: goalId })

    res.status(200).json({ message: "Goal deleted" })
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error occurred while deleting goal and habits", error })
  }
})

module.exports = router
