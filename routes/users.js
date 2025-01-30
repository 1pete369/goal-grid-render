const express = require("express")

const user = require("../models/user_model")

const mongoose = require("mongoose")
var ObjectId = require("mongodb").ObjectId

const router = express.Router()

router.get("/", (req, res) => {
  res.json({ message: "Hello bro" })
})

// router.get("/:id", async (req, res) => {
//   const email = req.params.id
//   console.log("User check called", email)
//   try {
//     const userObject = await user.find({ "personalInfo.email": email })
//     console.log(userObject)
//     if (userObject.length > 0) {
//       res.json({ message: "User fetched", userObject, status: 1 })
//     } else {
//       res.json({ message: "User not fetched", userObject, status: 0 })
//     }
//   } catch (error) {
//     console.log("Error")
//     res.json({ message: "Error", error })
//   }
// })

router.patch("/updateLastLogin/:id", async (req, res) => {
  const { id } = req.params

  console.log("id", id)
  try {
    const result = await user.findOneAndUpdate(
      { uid: id },
      { "timings.lastLoginAt": new Date().toISOString() },
      { new: true } // Return the updated document
    )

    if (result) {
      return res
        .status(200)
        .json({ message: "Last login updated successfully", user: result })
    } else {
      return res.status(404).json({ error: "User not found" })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
})

router.post("/create-user", async (req, res) => {
  const mainUserObject = req.body.user

  console.log("Main user Object Received ", mainUserObject)

  console.log("user", mainUserObject)
  try {
    const newUser = new user(mainUserObject)
    await newUser.save()
    res.json({ message: "user Added", user: newUser })
  } catch (err) {
    res.json({ message: err.message })
  }
})

router.get("/check-user/:id", async (req, res) => {
  const uid = req.params.id
  try {
    console.log("Check user called")
    const userExistedOrNot = await user.find({ uid: uid })
    if (userExistedOrNot.length > 0) {
      res.json({ message: "user already exists", exist: true })
    } else {
      res.json({ message: "user not existed", exist: false })
    }
  } catch (err) {
    res.json({ message: err.message })
  }
})

router.get("/fetch-user/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const mainUserObject = await user.findOne({ uid: uid })

    console.log(mainUserObject)
    res.json({ userObject: mainUserObject })
  } catch (err) {
    res.json({ message: err.message })
  }
})

router.patch("/update-profile/:id", async (req, res) => {
  const uid = req.params.id

  console.log("update fields called")
  console.log("Request Body:", req.body)

  // Access username and name from req.body.updateFields
  const { username, name } = req.body.updateFields || {}

  const updateFieldsObj = {}
  if (username) updateFieldsObj["personalInfo.username"] = username
  if (name) updateFieldsObj["personalInfo.displayName"] = name

  try {
    const userObject = await user.findOneAndUpdate(
      { uid },
      { $set: updateFieldsObj },
      { new: true }
    )

    if (!userObject) {
      return res.status(404).json({ message: "User not found", flag: false })
    }

    res.json({ userObject, flag: true })
  } catch (err) {
    console.error("Error updating profile:", err.message)
    res.status(500).json({
      message: "An error occurred while updating the profile",
      flag: false
    })
  }
})

router.get("/check-username/:id", async (req, res) => {
  const username = req.params.id
  console.log("Check username called", username)
  try {
    const users = await user.find()
    console.log(users)
    const isAlreadyExist = users.filter(
      (user) => user.personalInfo.username === username
    )
    console.log(isAlreadyExist)
    if (isAlreadyExist.length > 0) {
      res.json({ message: "userName already existed", exist: true })
    } else {
      res.json({ message: "userName not existed", exist: false })
    }
  } catch (err) {
    res.json({ message: err.message })
  }
})


router.get("/get-full-user/:id", async (req, res) => {
  const uid = req.params.id
  console.log("Getuser id", uid)
  try {
    const fullUserObject = await user
      .findOne({ uid })
      .populate({
        path: "customData.days",
        populate: {
          path: "todos"
        }
      })
      .exec()
    res.json({ message: "Populated user Object", fullUserObject })
  } catch (err) {
    res.json({ Error: err })
  }
})

router.get("/get-all-users", async (req, res) => {
  try {
    const allUsers = await user.find()
    console.log("All users", allUsers)
    res.json({ message: "All users fetched", allUsers })
  } catch (err) {
    res.json({ Error: err })
  }
})

router.patch("/update-onboardingdata/:id", async (req, res) => {
  const uid = req.params.id

  console.log("update fields called")
  console.log("Uid", uid)
  console.log("Request Body:", req.body)

  // Access username and name from req.body.updateFields
  const {
    name,
    username,
    dob,
    gender,
    profession,
    referralSource,
    intendedUseCases
  } = req.body || {}

  const updateFieldsObj = {}

  if (username) updateFieldsObj["personalInfo.username"] = username
  if (name) updateFieldsObj["personalInfo.name"] = name
  if (dob) updateFieldsObj["personalInfo.dob"] = dob
  if (gender) updateFieldsObj["personalInfo.gender"] = gender
  if (profession) updateFieldsObj["personalInfo.profession"] = profession
  if (referralSource)
    updateFieldsObj["personalInfo.referralSource"] = referralSource
  if (intendedUseCases)
    updateFieldsObj["personalInfo.intendedUseCases"] = intendedUseCases
  try {
    const userObject = await user.findOneAndUpdate(
      { uid },
      { $set: updateFieldsObj, isOnboardingComplete: true },
      { new: true }
    )

    if (!userObject) {
      return res.status(404).json({ message: "User not found", flag: false })
    }

    res.json({ userObject, flag: true })
  } catch (err) {
    console.error("Error updating profile:", err.message)
    res.status(500).json({
      message: "An error occurred while updating the profile",
      flag: false
    })
  }
})

router.get("/onboarding-status/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const userObject = await user.findOne({ uid: uid })
    if (userObject) {
      res.json({
        message: "onBoardingStatus",
        flag: userObject.isOnboardingComplete
      })
    } else {
      res.json({ message: "onboarding not existed ", flag: false })
    }
  } catch (err) {
    console.error("Error onboarding status:", err.message)
    res
      .status(500)
      .json({ message: "An error occurred onboarding status", flag: false })
  }
})

router.patch("/push-friend-id/:id", async (req, res) => {
  const uid = req.params.id
  const { _id, recipientId } = req.body
  const _idForDB = new mongoose.Types.ObjectId(_id)

  try {
    const userObject = await user.findOneAndUpdate(
      { uid },
      { $push: { "customData.friends": _idForDB } },
      { new: true }
    )
    const userObject2 = await user.findOneAndUpdate(
      { uid: recipientId },
      { $push: { "customData.friends": _idForDB } },
      { new: true }
    )
    res.json({
      message: "Pushed Friend ID successfully",
      userObject,
      userObject2
    })
  } catch (error) {
    console.error("Error pushing id", err.message)
    res.status(500).json({ message: "An error occurred pushing friend" })
  }
})

router.patch("/pop-friend-id/:id", async (req, res) => {
  const uid = req.params.id
  const { _id, recipientId } = req.body
  console.log(_id)
  const _idForDB = new ObjectId(_id)

  try {
    const userObject = await user.findOneAndUpdate(
      { uid },
      { $pull: { "customData.friends": _idForDB } },
      { new: true }
    )
    const userObject2 = await user.findOneAndUpdate(
      { uid: recipientId },
      { $pull: { "customData.friends": _idForDB } },
      { new: true }
    )
    res.json({
      message: "popped Friend ID successfully",
      userObject,
      userObject2
    })
  } catch (error) {
    console.error("Error popping id", error.message)
    res.status(500).json({ message: "An error occurred pushing friend" })
  }
})

router.get("/get-friends-list/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const userObject = await user
      .findOne({ uid }) // Use findOne to fetch a single user
      .select("customData.friends") // Select only the friends array
      .populate({
        path: "customData.friends" // Populate the friends array
      })
      .exec()

    if (!userObject) {
      return res.status(404).json({ message: "User not found" })
    }

    const friends = userObject.customData.friends

    res.json({ message: "User friends fetched", friends })
  } catch (error) {
    console.error("Error fetching friends:", error.message)
    res.status(500).json({
      message: "An error occurred fetching friends",
      error: error.message
    })
  }
})

router.post("/get-users-by-ids", async (req, res) => {
  const { userIds } = req.body
  console.log("userIds", userIds)
  try {
    const users = await user.find(
      { uid: { $in: userIds } },
      {
        uid: 1,
        "personalInfo.name": 1,
        "personalInfo.username": 1,
        "personalInfo.photoURL": 1
      } // Only include these fields
    )

    console.log("users", users)
    res.status(200).json({ users })
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" })
  }
})

router.patch("/update-subscription-status/:id", async (req, res) => {
  const uid = req.params.id
  const plan = req.body.plan
  try {
    const status_updated = await user.findOneAndUpdate(
      { uid },
      {
        $set: { "customData.subscription": plan }
      },
      { new: true }
    )

    console.log("subscription status updated", status_updated)
    res
      .status(200)
      .json({ message: "subscription status updated", status_updated })
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" })
  }
})

// router.patch("/push-subscription-id/:id", async (req, res) => {
//   const uid = req.params.id
//   const { _id } = req.body
//   const _idForDB = new mongoose.Types.ObjectId(_id)
//   try {
//     const userObject = await user.findOneAndUpdate(
//       { uid },
//       {
//         $set: { "customData.subscription": _idForDB }
//       },
//       { new: true }
//     )
//     res.json({ message: "subscription ID pushed to user", userObject })
//   } catch (error) {
//     res.json({ message: "Error pushing subscription id", error })
//   }
// })

module.exports = router
