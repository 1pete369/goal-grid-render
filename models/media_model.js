
const mongoose = require("mongoose")

const mediaSchema = new mongoose.Schema({
    id: String,    
    uid : String,
    type : { type: String, enum: ["image", "video"], required: true },
    url : String,
    createdAt : String,
})

module.exports = mongoose.model("Media", mediaSchema)