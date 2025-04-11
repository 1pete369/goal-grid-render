const express = require("express");
const Note = require("../models/note_model");
const verifyJWT = require("../middleware/verifyJWT");
const router = express.Router();

// 🔐 Get all notes for a user
router.get("/get-notes/:id", verifyJWT, async (req, res) => {
  const uid = req.params.id
  if (req.user.uid !== uid) {
    return res.status(403).json({ message: "Forbidden: UID mismatch" })
  }

  try {
    const notes = await Note.find({ uid })
    res.status(200).json({
      message: notes.length > 0 ? "Notes found!" : "No notes found!",
      notes,
    })
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes", error: error.message })
  }
})

// 🔐 Get resource count
router.get("/get-resource-count/:id", verifyJWT, async (req, res) => {
  const uid = req.params.id
  if (req.user.uid !== uid) {
    return res.status(403).json({ message: "Forbidden: UID mismatch" })
  }

  try {
    const resourceCount = await Note.countDocuments({ uid })
    res.status(200).json({ resourceCount })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// 🔐 Get a single note by ID
router.get("/get-note/:id", verifyJWT, async (req, res) => {
  const id = req.params.id
  try {
    const note = await Note.findOne({ id })
    if (!note || req.user.uid !== note.uid) {
      return res.status(404).json({ message: "Note not found or forbidden" })
    }
    res.status(200).json({ message: "Note found!", note })
  } catch (error) {
    res.status(500).json({ message: "Error fetching note", error: error.message })
  }
})

// 🔐 Create a new note
router.post("/create-note", verifyJWT, async (req, res) => {
  const { noteObj } = req.body
  if (req.user.uid !== noteObj.uid) {
    return res.status(403).json({ message: "Forbidden: UID mismatch" })
  }

  try {
    const noteCreated = new Note(noteObj)
    await noteCreated.save()
    res.status(201).json({ message: "Note created successfully", noteCreated })
  } catch (error) {
    res.status(500).json({ message: "Error creating note", error: error.message })
  }
})

// 🔐 Update note
router.patch("/update-note/:id", verifyJWT, async (req, res) => {
  const id = req.params.id
  const { noteObj } = req.body

  try {
    const existingNote = await Note.findOne({ id })
    if (!existingNote || req.user.uid !== existingNote.uid) {
      return res.status(403).json({ message: "Forbidden or Note not found" })
    }

    const noteUpdated = await Note.findOneAndUpdate(
      { id },
      { $set: { name: noteObj.name, content: noteObj.content } },
      { new: true }
    )

    res.status(200).json({ message: "Note updated successfully", noteUpdated })
  } catch (error) {
    res.status(500).json({ message: "Error updating note", error: error.message })
  }
})

// 🔐 Delete note
router.delete("/delete-note/:id", verifyJWT, async (req, res) => {
  const id = req.params.id

  try {
    const existingNote = await Note.findOne({ id })
    if (!existingNote || req.user.uid !== existingNote.uid) {
      return res.status(403).json({ message: "Forbidden or Note not found" })
    }

    const noteDeleted = await Note.findOneAndDelete({ id })
    res.status(200).json({ message: "Note deleted successfully", noteDeleted })
  } catch (error) {
    res.status(500).json({ message: "Error deleting note", error: error.message })
  }
})


module.exports = router