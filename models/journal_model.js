const mongoose = require("mongoose")

const Journal = new mongoose.Schema({
    id: String,
    uid : String,
    name: String,
    content : String,
    createdDate : String,    
    createdAt : String
})


module.exports = mongoose.model("Journal",Journal)