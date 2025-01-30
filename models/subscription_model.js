const mongoose = require("mongoose")


const subscriptionSchema = new mongoose.Schema({
    id : String,
    uid: String,
    plan: { type: String, enum: ["free","personal", "community", "premium","diamond"], required: true },
    startDate: String,
    expiryDate: String,
    isActive: { type: Boolean, default: true },
    durationInMonths : {type : Number, required : true}
});

module.exports = mongoose.model("Subscription", subscriptionSchema);