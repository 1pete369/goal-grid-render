const express = require("express")
const Room = require("../models/room_model")
const router = express.Router()

router.get("/get-room-by-name/:roomname", async (req, res) => {
  const roomName = req.params.roomname
  console.log("roomName", roomName)
  try {
    const roomFetched = await Room.findOne({ name: roomName })
    console.log(roomFetched)
    if(roomFetched){
      res.json({ message: "Room fetched successfully", room: roomFetched })
    }else{
      res.json({message: "Room Not Found"})
    }
  } catch (error) {
    res.json({ message: "Error", error })
  }
})

router.post("/create-room", async (req, res) => {
  const { roomObject } = req.body
  try {
    const newRoom = new Room(roomObject)
    await newRoom.save()

    res.json({ message: "Room Created", newRoom })
  } catch (error) {
    res.json({ message: "Error" })
  }
})

router.get("/is-user-joined", async (req, res) => {
  const { id, roomName } = req.query
  console.log(req.params)

  console.log("In User Join checking")
  console.log("Id , roomname", { id, roomName })
  try {
    const room = await Room.findOne({ name: roomName })
    const isUserJoined = room.usersJoined.includes(id)
    if (isUserJoined) {
      res.json({ message: "user joined", isUserJoined })
    } else {
      res.json({ message: "user not joined", isUserJoined })
    }
  } catch (error) {
    res.json({ message: "Error" })
  }
})

router.patch("/join-the-user", async (req, res) => {
  const { id, roomName } = req.body
  try {
    const updatedRoom = await Room.findOneAndUpdate(
      {
        name: roomName
      },
      {
        $push: { usersJoined: id }
      },
      { new: true }
    )
    if (updatedRoom) {
      res.json({ message: "User Joined", updatedRoom, flag: true })
    } else {
      res.json({ message: "User Joined", updatedRoom, flag: false })
    }
  } catch (error) {
    res.json({ message: "Error" })
  }
})

module.exports = router
