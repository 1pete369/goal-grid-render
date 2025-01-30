const express = require("express")
const Note = require("../models/note_model")
const router = express.Router()

router.get("/get-notes/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const notes = await Note.find({ uid })
    if (notes.length > 0) {
      res.json({ message: "Notes found!", notes })
    } else {
      res.json({ message: "No notes found!", notes })
    }
  } catch (error) {
    res.json({ message: "Error fetching notes", error })
  }
})

router.get("/get-note/:id", async (req, res) => {
  const id = req.params.id
  try {
    const note = await Note.findOne({ id })
    if (!note) {
      res.status(404).json({ message: "Note not found" })
    }
    res.status(200).json({ message: "Note found!", note })
  } catch (error) {
    res.json({ message: "Error fetching notes", error })
  }
})

router.post("/create-note", async (req, res) => {
  const { noteObj } = req.body
  try {
    const noteCreated = new Note(noteObj)
    await noteCreated.save()
    res.json({ message: "Note created successfully", noteCreated })
  } catch (error) {
    res.json({ message: "Error creating note", error })
  }
})

router.patch("/update-note/:id", async (req, res) => {
  const id = req.params.id
  const { noteObj } = req.body
  console.log(noteObj)
  try {
    const noteUpdated = await Note.findOneAndUpdate(
      { id },
      { $set: { name: noteObj.name, content: noteObj.content } },
      { new: true }
    )
    res.json({ message: "Note upadated succesfully", noteUpdated })
  } catch (error) {
    res.json({ message: "Error updating note", error })
  }
})

router.delete("/delete-note/:id", async (req, res) => {
  const id = req.params.id
  try {
    const noteDeleted = await Note.findOneAndDelete({ id })
    if (!noteDeleted) {
      res.status(404).json({ message: "Note not found" })
    }
    res.status(200).json({ message: "Note deleted successfully" , noteDeleted })
  } catch (error) {
    res.json({ message: "Error deleting note", error })
  }
})

module.exports = router
