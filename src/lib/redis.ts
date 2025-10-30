import Redis from "ioredis";

// Create Redis connection
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number.parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
  // Only add password if it exists
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
};

console.log("[Redis] Connecting to Redis:", {
  host: redisConfig.host,
  port: redisConfig.port,
  hasPassword: !!redisConfig.password,
});

export const redis = new Redis(redisConfig);

redis.on("connect", () => {
  console.log("[Redis] ✅ Connected to Redis");
});

redis.on("error", (error) => {
  console.error("[Redis] ❌ Connection error:", error);
});

export default redis;
