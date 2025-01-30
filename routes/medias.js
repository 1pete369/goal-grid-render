const express = require("express")
const Media = require("../models/media_model")
const router = express.Router()

router.post("/create-media", async (req, res) => {
  const { mediaObject } = req.body
  try {
    const newMedia = new Media(mediaObject)
    await newMedia.save()
    res.json({ message: "New Media Created", mediaObject })
  } catch (error) {
    res.json({ message: "Error creating media", error })
  }
})

router.get("/get-media/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const medias = await Media.find({uid})
    res.json({ message: "Media Fetched successfully", medias })
  } catch (error) {
    res.json({ message: "Error fetching media", error })
  }
})

router.delete("/delete-media/:id", async (req, res) => {
    const id = req.params.id
    try {
      const mediaDeleted = await Media.findOneAndDelete({ id })
      res.json({ message: "Media deleted successfully", mediaDeleted })
    } catch (error) {
      res.json({ message: "Error deleting media", error })
    }
  })
  

module.exports = router
