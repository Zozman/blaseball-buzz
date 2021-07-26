const express = require("express");
const path = require("path");
const app = express();

// Serve our static assets
app.use("/", express.static(path.join(__dirname, "dist")));

// Create 1 endpoint to get the Setting for the app from
// This is why we have this server at all
app.get("/settings", (req, res) => {
  res.json({
    EventStream:
      process.env.EVENT_STREAM ||
      "https://api.sibr.dev/replay/v1/replay?from=2021-07-01T01:00:08.17Z",
  });
});

// Start web server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server Started On Port ${port}`);
});
