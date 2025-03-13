const express = require("express")
const Journal = require("../models/journal_model")
const router = express.Router()

// Get all journals for a user
router.get("/get-journals/:id", async (req, res) => {
  const uid = req.params.id
  console.log("User id",uid)
  try {
    const journals = await Journal.find({ uid })
    console.log("Journals",journals)
    if (journals.length === 0) {
      console.log("Empty journals")
      return res.status(200).json({ message: "No journals found", journals: [] })
    }
    res.status(200).json({ message: "Journals found", journals })
  } catch (error) {
    res.status(500).json({ message: "Error fetching journals", error: error.message })
  }
})

router.get("/get-resource-count/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const resourceCount = await Journal.countDocuments({ uid })
    if (resourceCount > 0) {
      res.status(200).json({ resourceCount })
    } else {
      res.status(200).json({ resourceCount: 0 })
    }
  } catch (error) {
    res.json(500).json({ error: "Internal server error" })
  }
})

// Get a single journal by ID
router.get("/get-journal/:id", async (req, res) => {
  const id = req.params.id
  try {
    const journal = await Journal.findOne({ id })
    if (!journal) {
      return res.status(404).json({ message: "Journal not found" })
    }
    res.status(200).json({ message: "Journal found", journal })
  } catch (error) {
    res.status(500).json({ message: "Error fetching journal", error: error.message })
  }
})

// Create a new journal
router.post("/create-journal", async (req, res) => {
  const { journalObj } = req.body
  try {
    if (!journalObj || !journalObj.name || !journalObj.content || !journalObj.uid) {
      return res.status(400).json({ message: "Missing required journal fields" })
    }
    const journalCreated = new Journal(journalObj)
    await journalCreated.save()
    res.status(201).json({ message: "Journal created successfully", journal: journalCreated })
  } catch (error) {
    res.status(500).json({ message: "Error creating journal", error: error.message })
  }
})

// Update an existing journal
router.patch("/update-journal/:id", async (req, res) => {
  const id = req.params.id
  const { journalObj } = req.body
  try {
    if (!journalObj || !journalObj.name || !journalObj.content) {
      return res.status(400).json({ message: "Missing required journal fields" })
    }
    const journalUpdated = await Journal.findOneAndUpdate(
      { id },
      { $set: { name: journalObj.name, content: journalObj.content } },
      { new: true }
    )
    if (!journalUpdated) {
      return res.status(404).json({ message: "Journal not found" })
    }
    res.status(200).json({ message: "Journal updated successfully", journal: journalUpdated })
  } catch (error) {
    res.status(500).json({ message: "Error updating journal", error: error.message })
  }
})

// Delete a journal
router.delete("/delete-journal/:id", async (req, res) => {
  const id = req.params.id
  try {
    const journalDeleted = await Journal.findOneAndDelete({ id })
    if (!journalDeleted) {
      return res.status(404).json({ message: "Journal not found" })
    }
    res.status(200).json({ message: "Journal deleted successfully", journal: journalDeleted })
  } catch (error) {
    res.status(500).json({ message: "Error deleting journal", error: error.message })
  }
})

module.exports = router
