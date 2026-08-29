const Redis = require("ioredis");
const client = new Redis({ host: "localhost", port: 6379 });

client.on("connect", () => {
  console.log("Redis connected");
  client
    .ping()
    .then((result) => {
      console.log("Ping result:", result);
      client.quit();
    })
    .catch((err) => {
      console.error("Ping error:", err);
      client.quit();
    });
});

client.on("error", (err) => {
  console.error("Redis error:", err);
  client.quit();
});
