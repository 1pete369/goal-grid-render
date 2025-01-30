const { createClient } = require('@redis/client');
require("dotenv").config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    tls: true,
  },
});

redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
};

module.exports = { redisClient, connectRedis };
