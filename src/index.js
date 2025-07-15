const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var path = require("path");
require("dotenv").config();

const fs = require("fs");
const DATA_FILE = path.join(__dirname, "lastUpdate.json");

function loadCurrentData() {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  }
  return {};
}

// TODO: Add Swagger documentation and set up correctly
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger"); // path to swagger.js above

const appkey = process.env.APPKEY || "yourappkey";
const PORT = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerBasicAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Basic ")) {
    res.setHeader(
      "WWW-Authenticate",
      'Basic realm="Swagger API Documentation"'
    );
    return res
      .status(401)
      .send("Authentication required for Swagger documentation");
  }

  const base64Credentials = auth.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8"
  );
  const [username, password] = credentials.split(":");

  const validUsername = process.env.SWAGGER_USER || "admin";
  const validPassword = process.env.SWAGGER_PASSWORD || "password";

  if (username === validUsername && password === validPassword) {
    return next();
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="Swagger API Documentation"');
  return res.status(401).send("Invalid credentials");
};

app.use(
  "/swagger",
  swaggerBasicAuth,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.get("/", (req, res) => {
  const displayMicrophone = process.env.DISPLAY_MICROPHONE !== "false";
  const displayAutomation = process.env.DISPLAY_AUTOMATION !== "false";
  const displayEOF = process.env.DISPLAY_EOF !== "false";

  res.render("index", { displayMicrophone, displayAutomation, displayEOF });
});

app.get("/lastUpdate", (req, res) => {
  const currentData = loadCurrentData();
  if (Object.keys(currentData).length === 0) {
    return res.status(404).json({ error: "No data found" });
  }
  res.json(currentData);
});

/**
 * @swagger
 * /:
 *   post:
 *     summary: Send data to connected clients
 *     description: Updates artist, title, microphone, automation, and end of file status
 *     security:
 *       - appkey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appkey
 *             properties:
 *               appkey:
 *                 type: string
 *                 example: 'yourappkey'
 *                 description: API key for authentication
 *               artist:
 *                 type: string
 *                 description: Artist name
 *                 example: 'Your Favourite Artist'
 *               title:
 *                 type: string
 *                 description: Track title
 *                 example: 'The Best Song Ever'
 *               duration:
 *                 type: string
 *                 description: Song duration in HH:MM:SS format
 *                 example: '00:03:45'
 *               microphone:
 *                 type: boolean
 *                 description: Microphone status (on/off)
 *               automation:
 *                 type: boolean
 *                 description: Automation status (on/off)
 *               eof:
 *                 type: boolean
 *                 description: End of file status (TBR)
 *     responses:
 *       200:
 *         description: Data successfully sent to clients
 *       400:
 *         description: Bad request - invalid key or parameter values
 *       500:
 *         description: Server error - Socket.io not initialized
 */
app.post("/", (req, res) => {
  var socket = io;

  if (!socket) {
    return res.status(500).send("Socket.io not initialized");
  }

  if (process.env.NODE_ENV !== "production") {
    const { key, ...sanitizedBody } = req.body;
    console.log("Received POST request with sanitized body:", sanitizedBody);
  } else {
    console.log("Received POST request");
  }

  if (String(req.body.appkey) !== appkey) {
    return res.status(400).json({ error: "Invalid or missing appkey" });
  }

  const allowedKeys = ["artist", "title", "microphone", "automation", "eof"];
  const filtered = {};

  for (const key of allowedKeys) {
    if (key in req.body) filtered[key] = req.body[key];
  }
  if (Object.keys(filtered).length === 0) {
    return res
      .status(400)
      .json({ error: "No valid keys provided in the request body" });
  }
  const currentData = loadCurrentData();
  const updatedData = { ...currentData, ...filtered };
  fs.writeFile(DATA_FILE, JSON.stringify(updatedData), (err) => {
    if (err) {
      console.error("Error writing to data file:", err);
    }
  });

  // TODO: Validate the request body structure and content, Check types, etc.
  if (req.body.artist) socket.emit("artist", req.body.artist);
  if (req.body.title) socket.emit("title", req.body.title);
  if (req.body.duration) socket.emit("duration", req.body.duration);

  if ("microphone" in req.body) {
    const mic = req.body.microphone;
    if (mic === true || mic === false || mic === "true" || mic === "false") {
      const isMicOn = mic === true || mic === "true";
      socket.emit("microphone", isMicOn);
    } else {
      console.warn("Invalid microphone value:", mic);
      return res
        .status(400)
        .send("Invalid microphone value. Only true or false is allowed.");
    }
  }

  if ("automation" in req.body) {
    const automation = req.body.automation;
    if (
      automation === true ||
      automation === false ||
      automation === "true" ||
      automation === "false"
    ) {
      const isAutoOn = automation === true || automation === "true";
      socket.emit("automation", isAutoOn);
    } else {
      console.warn("Invalid automation value:", automation);
      return res
        .status(400)
        .send("Invalid automation value. Only true or false is allowed.");
    }
  }

  if ("eof" in req.body) {
    const endOfFile = req.body.eof;
    if (
      endOfFile === true ||
      endOfFile === false ||
      String(endOfFile) === "true" ||
      String(endOfFile) === "false"
    ) {
      const isEndOfFile = endOfFile === true || String(endOfFile) === "true";
      socket.emit("eof", isEndOfFile);
    } else {
      console.warn("Invalid eof value:", endOfFile);
      return res
        .status(400)
        .send("Invalid eof value. Only true or false is allowed.");
    }
  }

  res.sendStatus(200);
});

server.listen(PORT, () => {
  console.log(`Server Listening on: http://localhost:${PORT}`);
});
