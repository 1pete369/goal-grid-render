const express = require("express")
const mongoose = require("mongoose")
const category = require("../models/category_model")

const router = express.Router()

router.get("/", (req, res) => {
  res.json({ message: "Categories Tab" })
})

router.get("/get-categories/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const categories = await category
      .find({ uid })
      .populate({ path: "categoryTodos" })
    console.log(categories)
    if (categories.length > 0) {
      res.json({ message: "Categories Found", categories })
    } else {
      res.json({ message: "No Categories", categories: [] })
    }
  } catch (error) {
    console.log(error)
    res.json({ error })
  }
})

router.post("/create-category", async (req, res) => {
  const categoryObject = req.body.category
  try {
    const newCategory = new category(categoryObject)
    await newCategory.save()
    res.json({ message: "Category created", newCategory })
  } catch (error) {
    console.log(error)
    res.json({ error })
  }
})

router.delete("/delete-category/:id", async (req, res) => {
  const id = req.params.id
  try {
    const response = await category.findOneAndDelete({ id })
    if (response) {
      res.json({ message: "Category Deleted" })
    } else {
      res.json({ message: "Category not found" })
    }
  } catch (error) {
    console.log(error)
    res.json({ error })
  }
})

router.patch("/push-todo-id/:id", async (req, res) => {
  const userId = req.params.id
  const { todoObjectId, categoryId } = req.body

  console.log("Push todo called in Days")

  const newtodoObjectId = new mongoose.Types.ObjectId(todoObjectId)

  try {
    const updatedTodo = await category.findOneAndUpdate(
      {
        uid: userId,
        id: categoryId
      },
      { $push: { categoryTodos: newtodoObjectId } },
      { new: true }
    )
    res.json({ updatedTodo })
  } catch (err) {
    res.json({ Error: err })
  }
})

router.patch("/pull-todo-id/:id", async (req, res) => {
  console.log("Pull todo id called")
  const id = req.params.id
  const categoryId = req.body.categoryId
  const todoObjectId = new mongoose.Types.ObjectId(id)
  console.log(id, categoryId)


  try {
    const deletedTodoId = await category.findOneAndUpdate(
      { categoryId },
      { $pull: { todos: todoObjectId } },
      { new: true }
    )

    res.json({ message: "Todo id deleted successfully", deletedTodoId })
  } catch (error) {
    console.log(error)
    res.json({ error })
  }
})

module.exports = router
