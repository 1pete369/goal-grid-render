const express = require("express")
const mongoose = require("mongoose")
const category = require("../models/category_model")

const router = express.Router()

// Categories Tab - Root Route
router.get("/", (req, res) => {
  res.status(200).json({ message: "Categories Tab" })
})

router.get("/get-resource-count/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const resourceCount = await category.countDocuments({ uid })
    if (resourceCount > 0) {
      res.status(200).json({ resourceCount })
    } else {
      res.status(200).json({ resourceCount: 0 })
    }
  } catch (error) {
    res.json(500).json({ error: "Internal server error" })
  }
})

// Get Categories for a specific user
router.get("/get-categories/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const categories = await category
      .find({ uid })
      .populate({ path: "categoryTodos" })
    if (categories.length > 0) {
      res.status(200).json({ message: "Categories Found", categories })
    } else {
      res.status(200).json({ message: "No Categories", categories: [] })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

// Create a new category
router.post("/create-category", async (req, res) => {
  const categoryObject = req.body.category
  console.log("Category object", categoryObject)
  try {
    const newCategory = new category(categoryObject)
    await newCategory.save()
    res.status(201).json({ message: "Category created", newCategory })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create category" })
  }
})

// Delete a category
router.delete("/delete-category/:id", async (req, res) => {
  const id = req.params.id
  try {
    const response = await category.findOneAndDelete({ id }) // Keeping 'id' as per your setup
    if (response) {
      res.status(200).json({ message: "Category Deleted" })
    } else {
      res.status(404).json({ message: "Category not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to delete category" })
  }
})

// Add Todo ID to Category
router.patch("/push-todo-id/:id", async (req, res) => {
  const userId = req.params.id
  const { todoObjectId, categoryId } = req.body

  console.log("Push todo called in Categories")

  const newtodoObjectId = new mongoose.Types.ObjectId(todoObjectId)

  try {
    const updatedCategory = await category.findOneAndUpdate(
      { uid: userId, id: categoryId }, // Keeping 'id' as per your setup
      { $push: { categoryTodos: newtodoObjectId } },
      { new: true }
    )

    if (updatedCategory) {
      res
        .status(200)
        .json({ message: "Todo added to category", updatedCategory })
    } else {
      res.status(404).json({ message: "Category not found" })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

// Remove Todo ID from Category
router.patch("/pull-todo-id/:id", async (req, res) => {
  console.log("Pull todo id called")
  const id = req.params.id
  const categoryId = req.body.categoryId
  const todoObjectId = new mongoose.Types.ObjectId(id)

  try {
    const updatedCategory = await category.findOneAndUpdate(
      { id: categoryId }, // Keeping 'id' as per your setup
      { $pull: { categoryTodos: todoObjectId } },
      { new: true }
    )

    if (updatedCategory) {
      res
        .status(200)
        .json({ message: "Todo removed from category", updatedCategory })
    } else {
      res.status(404).json({ message: "Category not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to remove todo" })
  }
})

module.exports = router
