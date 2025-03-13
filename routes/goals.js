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
  console.log("Came to get goal",id)
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
  console.log("at update goal progress",goalObject)
  try {
    const updatedGoal = await goal.findOneAndUpdate(
      { id },
      {
        $set: { progress: goalObject.progress }
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

// Route for updating the duration of a goal
// router.patch("/update-goal-duration/:id", async (req, res) => {
//   const id = req.params.id
//   const habitDuration = req.body.duration
//   try {
//     const updatedGoal = await goal.findOneAndUpdate(
//       { id },
//       {
//         $inc: { duration: habitDuration }
//       },
//       { new: true }
//     )
//     if (!updatedGoal) {
//       return res.status(404).json({ message: "Goal Not Found" })
//     }
//     res.status(200).json({ message: "Goal Duration Updated", updatedGoal })
//   } catch (error) {
//     res.status(500).json({ message: "Error Occurred", Error: error.message })
//   }
// })

router.delete("/delete-goal/:id", async (req, res) => {

  const goalId = req.params.id

  if (!goalId) {
    return res.status(400).json({ message: "Goal ID is required" });
  }

  try {
    // Delete the linked habits
    // Delete the goal
    await goal.findOneAndDelete({id:goalId});

    res.status(200).json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error occurred while deleting goal and habits", error });
  }
});

module.exports = router
