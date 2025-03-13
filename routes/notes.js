const express = require("express");
const Note = require("../models/note_model");
const router = express.Router();

// Get all notes for a user
router.get("/get-notes/:id", async (req, res) => {
  const uid = req.params.id;
  try {
    const notes = await Note.find({ uid });
    res.status(200).json({
      message: notes.length > 0 ? "Notes found!" : "No notes found!",
      notes,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes", error: error.message });
  }
});

router.get("/get-resource-count/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const resourceCount = await Note.countDocuments({ uid })
    if (resourceCount > 0) {
      res.status(200).json({ resourceCount })
    } else {
      res.status(200).json({ resourceCount: 0 })
    }
  } catch (error) {
    res.json(500).json({ error: "Internal server error" })
  }
})


// Get a single note by ID
router.get("/get-note/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const note = await Note.findOne({ id });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ message: "Note found!", note });
  } catch (error) {
    res.status(500).json({ message: "Error fetching note", error: error.message });
  }
});

// Create a new note
router.post("/create-note", async (req, res) => {
  const { noteObj } = req.body;
  try {
    const noteCreated = new Note(noteObj);
    await noteCreated.save();
    res.status(201).json({ message: "Note created successfully", noteCreated });
  } catch (error) {
    res.status(500).json({ message: "Error creating note", error: error.message });
  }
});

// Update an existing note
router.patch("/update-note/:id", async (req, res) => {
  const id = req.params.id;
  const { noteObj } = req.body;
  try {
    const noteUpdated = await Note.findOneAndUpdate(
      { id },
      { $set: { name: noteObj.name, content: noteObj.content } },
      { new: true }
    );
    if (!noteUpdated) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ message: "Note updated successfully", noteUpdated });
  } catch (error) {
    res.status(500).json({ message: "Error updating note", error: error.message });
  }
});

// Delete a note
router.delete("/delete-note/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const noteDeleted = await Note.findOneAndDelete({ id });
    if (!noteDeleted) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ message: "Note deleted successfully", noteDeleted });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note", error: error.message });
  }
});

module.exports = router;
