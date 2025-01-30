const express = require("express")
const Journal = require("../models/journal_model")
const router = express.Router()

router.get("/get-journals/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const journals = await Journal.find({ uid })
    if (journals.length > 0) {
      res.json({ message: "journals found!", journals })
    } else {
      res.json({ message: "No journals found!", journals })
    }
  } catch (error) {
    res.json({ message: "Error fetching journals", error })
  }
})

router.get("/get-journal/:id", async (req, res) => {
  const id = req.params.id
  try {
    const journal = await Journal.findOne({ id })
    if (!journal) {
      res.status(404).json({ message: "Journal not found" })
    }
    res.status(200).json({ message: "Journal found!", journal })
  } catch (error) {
    res.json({ message: "Error fetching journals", error })
  }
})

router.post("/create-journal", async (req, res) => {
  const { journalObj } = req.body
  try {
    const journalCreated = new Journal(journalObj)
    await journalCreated.save()
    res.json({ message: "Journal created successfully", journalCreated })
  } catch (error) {
    res.json({ message: "Error creating journal", error })
  }
})

router.patch("/update-journal/:id", async (req, res) => {
  const id = req.params.id
  const { journalObj } = req.body
  try {
    const journalUpdated = await Journal.findOneAndUpdate(
      { id },
      { $set: { name: journalObj.name, content: journalObj.content } },
      { new: true }
    )
    res.json({ message: "Journal upadated succesfully", journalUpdated })
  } catch (error) {
    res.json({ message: "Error updating journal", error })
  }
})

router.delete("/delete-journal/:id", async (req, res) => {
  const id = req.params.id
  try {
    const journalDeleted = await Journal.findOneAndDelete({ id })
    if (!journalDeleted) {
      res.status(404).json({ message: "Journal not found" })
    }
    res.status(200).json({ message: "Journal deleted successfully", journalDeleted })
  } catch (error) {
    res.json({ message: "Error deleting journal", error })
  }
})

module.exports = router
