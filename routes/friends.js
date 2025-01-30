const express = require("express")
const router = express.Router()
const Friend = require("../models/friend_model")

router.post("/send-friend-request", async (req, res) => {
  const friendRequestObj = req.body
  const { recipientId, requesterId } = friendRequestObj
  try {
    const isAlreadyExist = await Friend.find({ recipientId, requesterId })
    console.log("isalreadyexists", isAlreadyExist)
    if (isAlreadyExist && isAlreadyExist.length > 0) {
      res.json({ message: "Request Alreday sent", isAlreadyExist })
    } else {
      const friendRequest = new Friend(friendRequestObj)
      await friendRequest.save()
      res.json({ message: "Request Added successfully", friendRequest })
    }
  } catch (error) {
    res.json({ message: "Request Error" })
  }
  console.log(req.body)
})

router.delete("/delete-friend-request", async (req, res) => {
  const {recipientId , requesterId} = req.body
  try {
    const deletedRequest = await Friend.findOneAndDelete({recipientId,requesterId});

    if (!deletedRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    res.status(200).json({ message: "Friend request deleted successfully", deletedRequest });
  } catch (error) {
    console.error("Error deleting friend request:", error);
    res.status(500).json({ message: "Request Error" });
  }
})

router.patch("/update-friend-request-status", async (req, res) => {
  const { requesterId, recipientId, status } = req.body
  try {
    const updatedFriendRequestObj = await Friend.findOneAndUpdate(
      { recipientId, requesterId },
      {
        $set: { status: status }
      },
      { new: true }
    )
    res.json({ message: "Request status updated", updatedFriendRequestObj })
  } catch (error) {
    res.json({ message: "Request not status updated" })
  }
})

router.get("/get-requests/:id", async (req, res) => {
  const uid = req.params.id
  try {
    // Fetch received friend requests (where recipientId matches user ID)
    const receivedRequests = await Friend.find({ recipientId: uid })

    // Fetch sent friend requests (where requesterId matches user ID)
    const sentRequests = await Friend.find({ requesterId: uid })

    // Combine the received and sent requests into one response
    res.json({
      message: "Requests fetched successfully",
      receivedRequests,
      sentRequests
    })
  } catch (error) {
    console.error("Error fetching friend requests:", error)
    res.status(500).json({ message: "Error fetching friend requests" })
  }
})

module.exports = router
