import { redisService } from "./src/services/redisService";

async function main() {
  try {
    // Test setting and getting a value
    await redisService.set("test:key", "Hello Redis", 10);
    const value = await redisService.get("test:key");
    console.log("Test value:", value);

    // Check the active alerts cache
    const activeAlertsCache = await redisService.get("alerts:active");
    console.log(
      "Active alerts cache:",
      activeAlertsCache ? JSON.parse(activeAlertsCache) : null,
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
