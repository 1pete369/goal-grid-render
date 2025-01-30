const mongoose = require("mongoose")

const Note = new mongoose.Schema({
    id: String,
    uid : String,
    name: String,
    content : String,
    createdDate : String,    
    createdAt : String
})


module.exports = mongoose.model("Note",Note)