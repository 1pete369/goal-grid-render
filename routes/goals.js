const express = require("express");
const mongoose = require("mongoose");
const goal = require("../models/goal_model");
const verifyJWT = require("../middleware/verifyJWT"); // JWT protection middleware

const router = express.Router();

// ------------------------------------------------------------------
// Test Route (Optional)
// ------------------------------------------------------------------
router.get("/", (req, res) => {
  res.status(200).json({ message: "In goal route" });
});

// ------------------------------------------------------------------
// GET - Resource count for goals for a user (Protected)
// ------------------------------------------------------------------
router.get("/get-resource-count/:id", verifyJWT, async (req, res) => {
  const uid = req.params.id;
  // Check if the UID in token matches the one in the route
  if (req.user.uid !== uid) {
    return res.status(403).json({ message: "Forbidden: UID mismatch" });
  }
  try {
    const resourceCount = await goal.countDocuments({ uid });
    res.status(200).json({ resourceCount });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------------------------------------------------
// POST - Create a new goal (Protected)
// ------------------------------------------------------------------
router.post("/create-goal", verifyJWT, async (req, res) => {
  // Expecting req.body.goal to have a 'uid' field
  const goalObject = req.body.goal;
  if (!goalObject || !goalObject.uid) {
    return res.status(400).json({ message: "Missing goal data" });
  }
  // Check that the UID in the token matches the one in the goalObject
  if (req.user.uid !== goalObject.uid) {
    return res.status(403).json({ message: "Forbidden: UID mismatch" });
  }
  try {
    const goalCreated = new goal(goalObject);
    await goalCreated.save();
    res.status(201).json({ message: "Goal Created", goalCreated });
  } catch (error) {
    res.status(500).json({ message: "Error Occurred", error: error.message });
  }
});

// ------------------------------------------------------------------
// GET - Fetch all goals of a user by user ID (Protected)
// ------------------------------------------------------------------
router.get("/get-goals/:id", verifyJWT, async (req, res) => {
  const uid = req.params.id;
  if (req.user.uid !== uid) {
    return res.status(403).json({ message: "Forbidden: UID mismatch" });
  }
  try {
    const goals = await goal.find({ uid }).populate({ path: "habits" });
    res.status(200).json({ message: "Goals Fetched", goals });
  } catch (error) {
    res.status(500).json({ message: "Error Occurred", error: error.message });
  }
});

// ------------------------------------------------------------------
// GET - Fetch a specific goal by its ID (Protected)
// ------------------------------------------------------------------
router.get("/get-goal/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  console.log("Came to get goal", id);
  try {
    const goalFetched = await goal.findOne({ id });
    // Also check that the goal's UID matches the token UID
    if (!goalFetched || req.user.uid !== goalFetched.uid) {
      return res.status(404).json({ message: "Goal Not Found" });
    }
    res.status(200).json({ message: "Goal Fetched", goal: goalFetched });
  } catch (error) {
    res.status(500).json({ message: "Error Occurred", error: error.message });
  }
});

// ------------------------------------------------------------------
// PATCH - Link a habit to a goal (Protected)
// ------------------------------------------------------------------
router.patch("/link-habit/:id", verifyJWT, async (req, res) => {
  const uid = req.params.id; // Here, assume the UID is passed in the URL
  if (req.user.uid !== uid) {
    return res.status(403).json({ message: "Forbidden: UID mismatch" });
  }
  const { habitIdInDb, linkedGoalId } = req.body;
  // Convert habitIdInDb string to ObjectId
  const habitObjectId = new mongoose.Types.ObjectId(habitIdInDb);
  try {
    const updatedGoal = await goal.findOneAndUpdate(
      { uid, id: linkedGoalId },
      { $push: { habits: habitObjectId } },
      { new: true }
    );
    if (!updatedGoal) {
      return res.status(404).json({ message: "Goal Not Found" });
    }
    res.status(200).json({ message: "Habit Linked Successfully", updatedGoal });
  } catch (error) {
    res.status(500).json({ message: "Error Occurred", error: error.message });
  }
});

// ------------------------------------------------------------------
// PATCH - Update the progress/status of a goal (Protected)
// ------------------------------------------------------------------
router.patch("/update-goal-status/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  const uid = req.user.uid;
  const goalObject = req.body.goal;

  try {
    const foundGoal = await goal.findOne({ id });

    if (!foundGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (foundGoal.uid !== uid) {
      return res.status(403).json({ message: "Not authorized to update this goal" });
    }

    const updatedGoal = await goal.findOneAndUpdate(
      { id },
      { $set: { progress: goalObject.progress, status: goalObject.status } },
      { new: true }
    );

    res.status(200).json({ message: "Goal progress updated", updatedGoal });
  } catch (error) {
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
});


// ------------------------------------------------------------------
// GET - Analytics for a user's goals (Protected)
// ------------------------------------------------------------------
router.get("/analytics/:id", verifyJWT, async (req, res) => {
  const uid = req.params.id;
  if (req.user.uid !== uid) {
    return res.status(403).json({ message: "Forbidden: UID mismatch" });
  }
  try {
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
        ? (goals.reduce((sum, goal) => sum + (goal.progress?.completionRate || 0), 0) / totalGoals).toFixed(2)
        : "0.00";
    // 2️⃣ Category-Wise Data
    const categoryStats = {};
    goals.forEach((goal) => {
      const category = goal.category || "Uncategorized";
      if (!categoryStats[category]) {
        categoryStats[category] = { totalProgress: 0, count: 0 };
      }
      categoryStats[category].totalProgress += goal.progress?.completionRate || 0;
      categoryStats[category].count++;
    });
    // 3️⃣ Convert to Array for Response
    const categoryPieChart = Object.entries(categoryStats).map(
      ([category, data]) => ({
        category,
        count: data.count,
        averageProgress: (data.totalProgress / data.count).toFixed(2),
      })
    );
    // Final response
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

// ------------------------------------------------------------------
// DELETE - Delete a goal (Protected)
// ------------------------------------------------------------------
router.delete("/delete-goal/:id", verifyJWT, async (req, res) => {
  const goalId = req.params.id;
  const uid = req.user.uid; // from JWT

  if (!goalId) {
    return res.status(400).json({ message: "Goal ID is required" });
  }

  try {
    const foundGoal = await goal.findOne({ id: goalId });

    if (!foundGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (foundGoal.uid !== uid) {
      return res.status(403).json({ message: "Not authorized to delete this goal" });
    }

    await goal.deleteOne({ id: goalId });
    res.status(200).json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
});


module.exports = router;