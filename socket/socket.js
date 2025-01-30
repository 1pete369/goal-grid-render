const { redisClient } = require("../config/redis");
const Chat = require("../models/chat_model");
const { createClient } = require('@redis/client');

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("sendMessage", async (messageData) => {
      const { id, message, uid, roomName, type, mediaUrl, mediaType } = messageData;

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
          createdAt: new Date().toISOString(),
        });

        await newMessage.save();
        console.log("Message saved:", newMessage);

        // Publish message to Redis
        await redisClient.publish("chatRoom", JSON.stringify(newMessage));

      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // ✅ Use a SEPARATE Redis client for subscription
  const subscriber = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
      tls: true,
    },
  });

  subscriber.on("error", (err) => console.error("Redis Subscriber Error:", err));

  (async () => {
    try {
      await subscriber.connect();
      console.log("Redis Subscriber Connected ✅");

      await subscriber.subscribe("chatRoom", (message) => {
        console.log("Received message from Redis:", message);
        io.emit("chatMessage", JSON.parse(message));
      });
    } catch (error) {
      console.error("Error connecting Redis subscriber:", error);
    }
  })();
};

module.exports = socketHandler;
