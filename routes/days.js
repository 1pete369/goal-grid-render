const express = require("express")

const router = express.Router()

const day = require("../models/day_model")
const { default: mongoose } = require("mongoose")

router.get("/", (req, res) => {
  res.json({ message: "Day Router" })
})

router.get("/check-day/:id", async (req, res) => {
  console.log("at check day")

  const uid = req.params.id
  const { date } = req.query

  console.log("Date", date)
  console.log("uid", uid)
  try {
    const isExists = await day.findOne({ uid, date: date })
    console.log("isExists", isExists)
    if (isExists !== null) {
      res.json({ message: "Day alredy exists", flag: true })
    } else {
      res.json({ message: "Day Not exists", flag: false })
    }
  } catch (err) {
    res.json({ Error: err })
  }
})

router.post("/create-day", async (req, res) => {
  const dayObject = req.body
  try {
    const isExists = await day.findOne({
      uid: dayObject.uid,
      date: dayObject.date
    })
    if (!isExists) {
      const createdDayObject = new day(dayObject)
      await createdDayObject.save()
      res.json({ message: "Day created", createdDayObject, flag: true })
    } else {
      res.json({ message: "Day Already exists", dayObject })
    }
  } catch (err) {
    res.json({ Error: err })
  }
})

router.post("/push-todo-id/:id", async (req, res) => {
  console.log("Push todo called in Days")

  const userId = req.params.id
  const { todoId, dayDate } = req.body

  const todoObjectId = new mongoose.Types.ObjectId(todoId)

  try {
    const updatedTodo = await day.findOneAndUpdate(
      { uid: userId, date: dayDate },
      { $push: { todos: todoObjectId } },
      { new: true }
    )
    res.json({ updatedTodo })
  } catch (err) {
    res.json({ Error: err })
  }
})

router.patch("/pull-todo-id/:id", async (req, res) => {
  console.log("Pull todo id called")
  const uid = req.params.id
  const { deleteTodoObjectId, dayDate } = req.body

  const todoObjectId = new mongoose.Types.ObjectId(deleteTodoObjectId)

  try {
    const deletedTodoId = await day.findOneAndUpdate(
      { uid, date: dayDate },
      { $pull: { todos: todoObjectId } },
      { new: true }
    )

    res.json({ message: "Todo id deleted successfully", deletedTodoId })
  } catch (err) {
    res.json({ Error: err })
  }
})

module.exports = router
