const express = require("express");
const helmet = require("helmet");
const path = require("path");
const expressStaticGzip = require("express-static-gzip");
const app = express();

// Apply basic express security
// We're skipping the CSP since the EVENT_STREAM could be from anywhere
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

// Do this to serve our static assets and use the minified files
app.use(
  expressStaticGzip(__dirname + "/dist", {
    enableBrotli: true,
    orderPreference: ["br", "gz"],
    setHeaders: function (res, path) {
      res.setHeader("Cache-Control", "public, max-age=31536000");
    },
  })
);

// Create 1 endpoint to get the Setting for the app from
// This is why we have this server at all
app.get("/settings", (req, res) => {
  res.json({
    EventStream:
      process.env.EVENT_STREAM ||
      // "https://api.sibr.dev/replay/v1/replay?from=2021-07-01T01:00:08.17Z",
      "https://cors-proxy.blaseball-reference.com/events/streamData",
  });
});

// Start web server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server Started On Port ${port}`);
});
