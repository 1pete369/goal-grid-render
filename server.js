const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

// Import configurations
const connectDB = require("./config/database");
const { connectRedis } = require("./config/redis");
const socketHandler = require("./socket/socket");

// Import routes
const users_router = require("./routes/users");
const todo_router = require("./routes/todos");
const day_router = require("./routes/days");
const habit_router = require("./routes/habits");
const goal_router = require("./routes/goals");
const category_router = require("./routes/categories");
const chat_router = require("./routes/chat");
const friend_router = require("./routes/friends");
const note_router = require("./routes/notes");
const journal_router = require("./routes/journals");
const subscription_router = require("./routes/subscriptions");
const credential_router = require("./routes/credentials");
const media_router = require("./routes/medias");
const room_router = require("./routes/rooms");

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["https://goalgrid.vercel.app","http://localhost:3000"], // Allow only this domain
    methods: ["GET", "POST"],
  },
});


// Middlewares
const allowedOrigins = ['https://goalgrid.vercel.app'];

app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer || req.headers.host;

  if (origin && allowedOrigins.includes(origin.replace(/\/$/, ''))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS'); // 🔥 Added PATCH
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});


app.use(express.json());

// Connect to MongoDB and Redis
connectDB();
connectRedis();

// Apply routes
app.get("/", (req, res) => {
  // console.log("API route accessed from: ", req.headers.origin); // Log the origin of the request
  res.json({ message: "Welcome to the Home API" , origin : req.headers.origin });
});

app.use("/users", users_router);
app.use("/todos", todo_router);
app.use("/days", day_router);
app.use("/categories", category_router);
app.use("/habits", habit_router);
app.use("/goals", goal_router);
app.use("/chats", chat_router);
app.use("/friends", friend_router);
app.use("/notes", note_router);
app.use("/journals", journal_router);
app.use("/subscriptions", subscription_router);
app.use("/credentials", credential_router);
app.use("/medias", media_router);
app.use("/rooms", room_router);

// Initialize Socket.IO
socketHandler(io);

// Start the server
const PORT = process.env.PORT_NUM;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
