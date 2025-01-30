const express = require("express")
const mongoose = require("mongoose")
const goal = require("../models/goal_model")

const router = express.Router()

router.get("/", (req, res) => {
  res.json({ message: "in goal route" })
})

router.post("/create-goal/:id", async (req, res) => {
  const uid = req.params.id
  const goalObject = req.body.goal
  try {
    const goalCreated = new goal(goalObject)
    await goalCreated.save()
    res.json({ message: "Goal Created", goalCreated })
  } catch (error) {
    res.json({ message: "Error Occured", Error: error })
  }
})

router.get("/get-goals/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const goals = await goal.find({ uid }).populate({
      path : "habits"
    })
    res.json({ message: "Goals Fetched", goals })
  } catch (error) {
    res.json({ message: "Error Occured", Error: error })
  }
})

router.get("/get-goal/:id", async (req, res) => {
  const id = req.params.id
  console.log(id)
  try {
    const goalFetched = await goal.findOne({ id })
    res.json({ message: "Goal Fetched", goal: goalFetched })
  } catch (error) {
    res.json({ message: "Error Occured", Error: error.message })
  }
})

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
    res.json({ message: "Habit Linked successfully", updatedGoal })
  } catch (error) {
    res.json({ message: "Error Occured", Error: error })
  }
})

router.patch("/update-goal-status/:id", async (req, res) => {
  const id = req.params.id
  const goalObject = req.body.goal
  console.log(id)
  try {
    const updatedGoal = await goal.findOneAndUpdate(
      { id },
      {
        $set: { progress: goalObject.progress }
      },
      { new: true }
    )
    res.json({ message: "Goal progress updated", updatedGoal })
  } catch (error) {
    res.json({ message: "Error Occured", Error: error })
  }
})


router.patch("/update-goal-duration/:id", async (req, res) => {
    const id = req.params.id
    const habitDuration = req.body.duration
    console.log(id)
    try {
      const updatedGoal = await goal.findOneAndUpdate(
        { id },
        {
          $inc: { duration : habitDuration }
        },
        { new: true }
      )
      res.json({ message: "Goal Duration updated", updatedGoal })
    } catch (error) {
      res.json({ message: "Error Occured", Error: error })
    }
  })
  

module.exports = router
