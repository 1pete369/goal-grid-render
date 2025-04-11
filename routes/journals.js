const express = require("express")
const Journal = require("../models/journal_model")
const verifyJWT = require("../middleware/verifyJWT")
const router = express.Router()

// 🔐 Get all journals for a user
router.get("/get-journals/:id", verifyJWT, async (req, res) => {
  const uid = req.params.id
  if (req.user.uid !== uid) {
    return res.status(403).json({ message: "Forbidden: UID mismatch" })
  }

  try {
    const journals = await Journal.find({ uid })
    res.status(200).json({
      message: journals.length > 0 ? "Journals found!" : "No journals found!",
      journals,
    })
  } catch (error) {
    res.status(500).json({ message: "Error fetching journals", error: error.message })
  }
})

// 🔐 Get journal count
router.get("/get-resource-count/:id", verifyJWT, async (req, res) => {
  const uid = req.params.id
  if (req.user.uid !== uid) {
    return res.status(403).json({ message: "Forbidden: UID mismatch" })
  }

  try {
    const resourceCount = await Journal.countDocuments({ uid })
    res.status(200).json({ resourceCount })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// 🔐 Get a single journal by ID
router.get("/get-journal/:id", verifyJWT, async (req, res) => {
  const id = req.params.id
  try {
    const journal = await Journal.findOne({ id })
    if (!journal || req.user.uid !== journal.uid) {
      return res.status(404).json({ message: "Journal not found or forbidden" })
    }
    res.status(200).json({ message: "Journal found!", journal })
  } catch (error) {
    res.status(500).json({ message: "Error fetching journal", error: error.message })
  }
})

// 🔐 Create a new journal
router.post("/create-journal", verifyJWT, async (req, res) => {
  const { journalObj } = req.body
  if (req.user.uid !== journalObj.uid) {
    return res.status(403).json({ message: "Forbidden: UID mismatch" })
  }

  try {
    const journalCreated = new Journal(journalObj)
    await journalCreated.save()
    res.status(201).json({ message: "Journal created successfully", journal: journalCreated })
  } catch (error) {
    res.status(500).json({ message: "Error creating journal", error: error.message })
  }
})

// 🔐 Update a journal
router.patch("/update-journal/:id", verifyJWT, async (req, res) => {
  const id = req.params.id
  const { journalObj } = req.body

  try {
    const existingJournal = await Journal.findOne({ id })
    if (!existingJournal || req.user.uid !== existingJournal.uid) {
      return res.status(403).json({ message: "Forbidden or Journal not found" })
    }

    const journalUpdated = await Journal.findOneAndUpdate(
      { id },
      { $set: { name: journalObj.name, content: journalObj.content } },
      { new: true }
    )

    res.status(200).json({ message: "Journal updated successfully", journal: journalUpdated })
  } catch (error) {
    res.status(500).json({ message: "Error updating journal", error: error.message })
  }
})

// 🔐 Delete a journal
router.delete("/delete-journal/:id", verifyJWT, async (req, res) => {
  const id = req.params.id

  try {
    const existingJournal = await Journal.findOne({ id })
    if (!existingJournal || req.user.uid !== existingJournal.uid) {
      return res.status(403).json({ message: "Forbidden or Journal not found" })
    }

    const journalDeleted = await Journal.findOneAndDelete({ id })
    res.status(200).json({ message: "Journal deleted successfully", journal: journalDeleted })
  } catch (error) {
    res.status(500).json({ message: "Error deleting journal", error: error.message })
  }
})

module.exports = router
