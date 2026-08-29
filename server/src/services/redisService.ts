import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

class RedisService {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      this.client = new Redis(
        process.env.REDIS_URL || "redis://localhost:6379",
        {
          maxRetriesPerRequest: 1,
          retryStrategy: (times) => {
            if (times > 3) {
              console.warn("Redis unavailable — running without cache");
              return null; // Stop retrying
            }
            return Math.min(times * 50, 2000);
          },
        },
      );

      this.client.on("connect", () => {
        this.isConnected = true;
        console.log("Redis connected successfully");
      });

      this.client.on("error", (err) => {
        if (this.isConnected) {
          console.warn("Redis error:", err.message);
        }
        this.isConnected = false;
      });
    } catch (error: any) {
      console.warn("Redis initialization failed — running without cache");
      this.isConnected = false;
    }
  }

  public async get(key: string): Promise<string | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      return await this.client.get(key);
    } catch (e) {
      return null;
    }
  }

  public async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (e) {
      console.warn(`Failed to set Redis key ${key}`);
    }
  }

  public async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.del(key);
    } catch (e) {
      console.warn(`Failed to delete Redis key ${key}`);
    }
  }
}

export const redisService = new RedisService();
