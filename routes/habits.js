const express = require("express")

const router = express.Router()

const habit = require("../models/habit_model")

router.get("/", (req, res) => {
  res.json({ message: "in habit route" })
})

router.get("/get-habits/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const habits = await habit.find({ uid })
    res.json({ message: "Habits Fetched", habits })
  } catch (error) {
    res.json({ message: "Error Occured", Error: error })
  }
})

router.post("/create-habit/:id", async (req, res) => {
  //   const uid = req.params.id
  const habitObject = req.body.habit
  console.log(habitObject)
  try {
    const habitCreated = new habit(habitObject)
    await habitCreated.save()
    res.json({ message: "Habit Created", habitCreated })
  } catch (error) {
    res.json({ message: "Error Occured", Error: error })
  }
})

router.patch("/update-habit-status/:id", async (req, res) => {
  const id = req.params.id
  console.log(id)
  const updatedHabit = req.body.habit
  console.log(updatedHabit)
  try {
    const habitUpdated = await habit.findOneAndUpdate(
      { id , uid: updatedHabit.uid}, // Find habit by ID
      {
        $set: {
          streak: updatedHabit.streak,
          progress: updatedHabit.progress,
          dailyTracking: updatedHabit.dailyTracking
        }
      },
      { new: true } // Return the updated document
    )

    if (!habitUpdated) {
      return res.status(404).json({ message: "Habit not found" })
    }

    res.json({ message: "Habit updated successfully", habitUpdated })
  } catch (error) {
    res.json({ message: "Error Occured", Error: error })
  }
})

module.exports = router
