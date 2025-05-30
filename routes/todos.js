const express = require("express")

const  todo  = require("../models/todo_model")
const verifyJWT = require("../middleware/verifyJWT")

const router = express.Router()

router.get("/", (req, res) => {
  try {
    res.json({ message: "Todo Route" })
  } catch (err) {
    res.json({ Error: err })
  }
})

router.get("/get-resource-count/:id",verifyJWT ,async (req, res) => {
  const uid = req.params.id
  if (req.user.uid !== uid) {
    return res.status(403).json({ message: "Forbidden: UID mismatch" });
  }
  try {
    const resourceCount = await todo.countDocuments({ uid })
    if (resourceCount > 0) {
      res.status(200).json({ resourceCount })
    } else {
      res.status(200).json({ resourceCount: 0 })
    }
  } catch (error) {
    res.json(500).json({ error: "Internal server error" })
  }
})


router.get("/get-todo/:id",verifyJWT , async (req, res) => {
  const id = req.params.id
  try {
    const fetchedTodo = await todo.findOne({ id , uid : req.user.uid})
    res.json({ todo: fetchedTodo })
  } catch (err) {
    res.json({ Error: err })
  }
})

router.post("/create-todo",verifyJWT , async (req, res) => {
  const todoObject = req.body.todo
  console.log(todoObject)
  if (req.user.uid !== todoObject.uid) {
    return res.status(403).json({ message: "Forbidden: UID mismatch" });
  }
  try {
    const newTodoObject = new todo(todoObject)
    await newTodoObject.save()
    res.json({ message: "Todo Added", newTodoObject, flag: true })
  } catch (err) {
    console.log("Error creating todo:", err) // Log the error for more details
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
      stack: err.stack
    })
  }
})

router.patch("/check-todo/:id",verifyJWT , async (req, res) => {
  const id = req.params.id
  const { categoryId, status } = req.body
  console.log("Check todos called", id, categoryId, status)
  try {
    const todoObject = await todo.findOneAndUpdate(
      { id , categoryId, uid : req.user.uid },
      { $set: {completed : status} },
      { new: true }
    )
    console.log(todoObject)
    res.json({ todoObject, flag: true })
  } catch (error) {
    console.log(error)
    res.json({ Error: error })
  }
})

router.delete("/delete-todo/:id",verifyJWT , async (req, res) => {
  const id = req.params.id
  try {
    const response = await todo.findOneAndDelete({ id , uid : req.user.uid})

    if (response) {
      res.json({
        message: "Todo deleted successfully",
        response,
        deleted: true
      })
    } else {
      res.json({ message: "Todo not found", response, deleted: false })
    }
  } catch (err) {
    res.json({ Error: err })
  }
})

module.exports = router
