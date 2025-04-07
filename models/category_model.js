const mongoose = require("mongoose")

const category = new mongoose.Schema({
    name : String,
    uid : String,
    id : String,
    dueDate :String,
    categoryTodos : [{type : mongoose.Schema.Types.ObjectId, ref : "todos"}],
    categoryColor : String,
    createdAt : String,
    completed : Boolean
})

module.exports = mongoose.model("category", category)

// uid: string
// name: string
// id: string
// dueDate: string
// categoryTodos: Todo[]
// categoryColor: string
// createdAt: string
// completed : boolean