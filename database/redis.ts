import { config } from "@/lib/config";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: config.env.upstash.redisRestUrl,
  token: config.env.upstash.redisRestToken,
});

export { redis };
