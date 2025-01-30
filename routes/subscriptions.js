const express = require("express")
const Subscription = require("../models/subscription_model")
const router = express.Router()

router.post("/create-subscription", async (req, res) => {
  const { subscriptionObject } = req.body
  try {
    const subscriptionObjectCreated = new Subscription(subscriptionObject)
    await subscriptionObjectCreated.save()
  
    res.json({
      message: "subscription created successfully",
      subscriptionObjectCreated, isCreated : true
    })
  } catch (error) {
    res.json({ message: "Error creating subscription", error })
  }
})

router.get("/check-subscription-status/:id", async (req, res) => {
  const uid = req.params.id
  try {
    const subscriptionObject = await Subscription.findOne({ uid })
    console.log(subscriptionObject)
    if (!subscriptionObject) {
      return res.json({
        message: "No Subscription found",
        plan: "free",
        isSubscriptionCreated : false
      })
    }
    return res.json({
      message: "Subscription status",
      plan: subscriptionObject.plan,
      isSubscriptionCreated : true
    })
  } catch (error) {
    res.json({ message: "Error creating subscription", error })
  }
})

router.patch("/update-subscription-status/:id", async (req, res) => {
  const uid = req.params.id
  const { plan, startDate, expiryDate, isActive } = req.body
  try {
    const subscriptionObject = await Subscription.findOneAndUpdate(
      { uid },
      { $set: { plan, startDate, expiryDate, isActive } },
      { new: true }
    )
    res.json({ message: "subscription status updated", subscriptionObject })
  } catch (error) {
    res.json({ message: "Error updating subscription status", error })
  }
})

module.exports = router
