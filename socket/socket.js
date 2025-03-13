const { default: axios } = require("axios")
const { redisClient } = require("../config/redis")
const Chat = require("../models/chat_model")
const { createClient } = require("@redis/client")

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected")

    socket.on('joinRoom', (roomName) => {
      console.log(`Joining room: ${roomName}`);
      socket.join(roomName); // Make the socket join the specified room
  
      // Optionally, you can emit a message to the room that a user has joined
      io.to(roomName).emit('chatMessage', { user: 'System', message: `${socket.id} has joined the room.` });
    });

    socket.on("sendMessage", async (messageData) => {
      const { id, message, uid, roomName, type, mediaUrl, mediaType } =
        messageData

      try {
        // Save message to MongoDB
        const newMessage = new Chat({
          id,
          uid,
          message,
          roomName,
          type,
          mediaUrl: mediaUrl || "",
          mediaType: mediaType || "none",
          createdAt: new Date().toISOString()
        })

        await newMessage.save()
        console.log(`Message saved in room ${roomName}:`, newMessage)

        // Publish message to the specific room's Redis channel
        await redisClient.publish(roomName, JSON.stringify(newMessage))
      } catch (error) {
        console.error("Error saving message:", error)
      }
    })

    socket.on("disconnect", () => {
      console.log("User disconnected")
    })
  })

  // ✅ Use a SEPARATE Redis client for subscription
  const subscriber = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
      tls: true
    }
  })

  subscriber.on("error", (err) => console.error("Redis Subscriber Error:", err))

  // Fetch all room names from the API and subscribe to channels dynamically
  ;(async () => {
    try {
      // Connect to Redis subscriber
      await subscriber.connect()
      console.log("Redis Subscriber Connected ✅")
  
      // Fetch all room names from the API
      const response = await axios.get("http://localhost:3001/rooms/get-all-rooms")
      const activeRooms = response.data // This is an array of room names directly
      console.log("activeRooms", activeRooms)
  
      // Subscribe to each room dynamically
      for (const roomName of activeRooms) {
        // Check if roomName is a valid string
        if (typeof roomName !== "string" || !roomName) {
          console.error(`Invalid roomName:`, roomName)
          continue // Skip this iteration if roomName is invalid
        }
  
        // Log the roomName
        console.log(`Subscribing to room: ${roomName}`)
  
        // Subscribe to each room individually
        await subscriber.subscribe(roomName, (message) => {
          try {
            const parsedMessage = JSON.parse(message)
            console.log(`Received message in room ${roomName}:`, parsedMessage)
  
            // Emit the message to the specific room
            io.to(roomName).emit("chatMessage", parsedMessage)
          } catch (err) {
            console.error(`Error parsing message for room ${roomName}:`, err)
          }
        })
        console.log(`Subscribed to room: ${roomName}`)
      }
    } catch (error) {
      console.error("Error connecting Redis subscriber:", error)
    }
  })()
  
  
}

module.exports = socketHandler
