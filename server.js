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
const allowedOrigins = ['https://goalgrid.vercel.app',"http://localhost:3000"];

// const allowedOrigins = ['your-frontend-domain.com']; // Replace with your frontend's domain

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin)) { // Only allow requests from the allowed origins
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));


app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {  // Allow requests from listed origins
    next();
  } else if (!origin && process.env.NODE_ENV === 'development') { // Allow requests without origin only in development
    next();
  } else if (!origin) { // For other cases when the origin is missing, you can add more logic here.
       return res.status(403).json({ message: 'Forbidden' });
  }
   else {
    return res.status(403).json({ message: 'Forbidden' });
  }
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
