const mongoose = require("mongoose")

const category = new mongoose.Schema({
    name : String,
    uid : String,
    id : String,
    dueDate :String,
    categoryTodos : [{type : mongoose.Schema.Types.ObjectId, ref : "todos"}],
    categoryColor : String
})

module.exports = mongoose.model("category", category)