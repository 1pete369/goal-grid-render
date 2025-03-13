const Habit = require("../models/habit_model")
const Goal = require("../models/goal_model")
const Note = require("../models/note_model")
const Journal = require("../models/journal_model")
const Task = require("../models/task_model")
const Category = require("../models/category_model")
const Todo = require("../models/todo_model")

const getModel = (resource) => {
  switch (resource) {
    case "habits":
      return Habit
    case "categories":
      return Category
    case "goals":
      return Goal
    case "notes":
      return Note
    case "journals":
      return Journal
    case "tasks":
      return Task
    case "todos":
      return Todo
    default:
      return null
  }
}

module.exports = { getModel }
