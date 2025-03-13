const User = require("../models/user_model")
const Subscription = require("../models/subscription_model")

const { getModel } = require("../utils/getModal")

const checkResourceCount = async (req, res) => {
  try {
    const { uid, resource } = req.query
    console.log("uid", uid)
    console.log("resource", resource)

    if (!uid || !resource) {
      return res.status(400).json({ error: "Missing required parameters" })
    }

    // Get user subscription plan
    const user = await User.findOne({ uid })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const userPlan = user?.customData?.subscription || "free"

    console.log("user plan", userPlan)

    // Get resource model dynamically
    const Model = getModel(resource)

    console.log("Model", Model)

    if (!Model) {
      return res.status(400).json({ error: "Invalid resource type" })
    }

    let countQuery = { uid }

    console.log("before if")
    
    if (resource === "tasks") {
        console.log("in tasks")
        // Get today's date at midnight (start of day)
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0) // Midnight of today

        // Filter tasks created today
        countQuery.createdAt = { $gte: todayStart }
    } else if (
        ["notes", "journals", "habits", "goals", "categories"].includes(resource)
    ) {
        // Fetch the subscription directly from the database
        const subscription = await Subscription.findOne({ uid: uid })
        
        console.log("in array ", subscription)
      // Check if subscription exists
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" })
      }

      const subscriptionStart = new Date(subscription.startDate); // Ensure this is correctly parsed as a Date object
      const nextResetDate = new Date(subscriptionStart);
      nextResetDate.setMonth(nextResetDate.getMonth() + 1); // Add one month
      
      const subscriptionStartISOString = subscriptionStart.toISOString();
      const nextResetDateISOString = nextResetDate.toISOString();
      
      // const journals = await Model.find({
      //   uid,
      //   createdAt: { $gte: subscriptionStartISOString, $lt: nextResetDateISOString }
      // });
      
      // console.log("journals", journals);
      // const count = journals.length;

      // Adjust the countQuery accordingly
      countQuery.createdAt = {
        $gte: subscriptionStartISOString, // Should be on or after the subscription start date
        $lt: nextResetDateISOString, // Should be before the next reset date
      };
    }      

    // // Count documents based on the query
    // const journals = await Model.find({
    //   uid,
    //   createdAt: { $gte: subscriptionStart, $lt: nextResetDate }
    // });
    
    // console.log("journals", journals);
    

    const count = await Model.countDocuments({uid : uid, createdAt : countQuery.createdAt})

    console.log("count",count)

    // Count the number of documents for this user
    // const count = await Model.countDocuments({ uid: uid });

    res.status(200).json({ count, plan: userPlan })
  } catch (error) {
    console.error("Error in checkResourceCount middleware:", error)
    res.status(500).json({ error: "Server error" })
  }
}

module.exports = checkResourceCount
