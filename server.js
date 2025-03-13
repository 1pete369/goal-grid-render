const express = require("express")
const cors = require("cors")
const http = require("http")
const socketIo = require("socket.io")
require("dotenv").config()

// Import configurations
const connectDB = require("./config/database")
const { connectRedis } = require("./config/redis")
const socketHandler = require("./socket/socket")

// Import routes
const users_router = require("./routes/users")
const todo_router = require("./routes/todos")
const day_router = require("./routes/days")
const habit_router = require("./routes/habits")
const goal_router = require("./routes/goals")
const category_router = require("./routes/categories")
const chat_router = require("./routes/chat")
const friend_router = require("./routes/friends")
const note_router = require("./routes/notes")
const journal_router = require("./routes/journals")
const subscription_router = require("./routes/subscriptions")
const credential_router = require("./routes/credentials")
const media_router = require("./routes/medias")
const room_router = require("./routes/rooms")
const task_router = require("./routes/tasks")
const resource_router = require("./routes/resourceRoutes")

// Initialize Express
const app = express()

app.use(express.json({ limit: '50mb' }));

const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: ["https://goalgrid.vercel.app", "http://localhost:3000"], // Allow only this domain
    methods: ["GET", "POST"]
  }
})

// Middlewares
const allowedOrigins = ["https://goalgrid.vercel.app", "http://localhost:3000"]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        // Allow requests with no origin (like mobile apps, Postman)
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // Allow credentials (cookies, auth headers)
  })
)

// Handle preflight requests
app.options("*", cors())

// Middleware to log and allow missing origins (helps in debugging)
app.use((req, res, next) => {
  // console.log("Incoming request origin:", req.headers.origin); // Debug log

  const origin = req.headers.origin
  if (!origin || allowedOrigins.includes(origin)) {
    next()
  } else {
    return res.status(403).json({ message: "Forbidden" })
  }
})

app.use(express.json())

// Connect to MongoDB and Redis
connectDB()
connectRedis()

// Apply routes
app.get("/", (req, res) => {
  // console.log("API route accessed from: ", req.headers.origin); // Log the origin of the request
  res.json({ message: "Welcome to the Home API", origin: req.headers.origin })
})

app.use("/users", users_router)
app.use("/todos", todo_router)
app.use("/days", day_router)
app.use("/categories", category_router)
app.use("/habits", habit_router)
app.use("/goals", goal_router)
app.use("/chats", chat_router)
app.use("/friends", friend_router)
app.use("/notes", note_router)
app.use("/journals", journal_router)
app.use("/subscriptions", subscription_router)
app.use("/credentials", credential_router)
app.use("/medias", media_router)
app.use("/rooms", room_router)
app.use("/today-tasks", task_router)
app.use("/resource-route", resource_router)

// Initialize Socket.IO
socketHandler(io)

// Start the server
const PORT = process.env.PORT_NUM
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

module.exports = app
