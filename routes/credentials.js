const express = require("express")
const router = express.Router()
const Credential = require("../models/credential_model")

router.get("/find-by-email/:id", async (req, res) => {
  const email = req.params.id
  try {
    const user = await Credential.findOne({ email })
    if (user) {
      res.json({ message: "User found", user, flag: true })
    } else {
      res.json({ message: "User Not found", flag: false })
    }
  } catch (error) {
    console.log(error)
    res.json({ message: "Error finding user by email", error })
  }
})

router.post("/create-credential-user", async (req, res) => {
    const { newCredentialUserObject } = req.body;
    try {
      const user = new Credential(newCredentialUserObject);
      await user.save();

      res.json({ message: "User Created", user});
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error creating user", error });
    }
  });
  

module.exports = router
