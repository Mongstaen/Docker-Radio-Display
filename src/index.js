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
    const parsedData = JSON.parse(data);
    
    // Migrate old format to new song history format
    if (!parsedData.songHistory && (parsedData.artist || parsedData.title)) {
      parsedData.songHistory = [];
      if (parsedData.artist && parsedData.title) {
        parsedData.songHistory.push({
          artist: parsedData.artist,
          title: parsedData.title,
          timestamp: new Date().toISOString()
        });
      }
      // Remove old fields after migration
      delete parsedData.artist;
      delete parsedData.title;
    }
    
    // Ensure songHistory exists
    if (!parsedData.songHistory) {
      parsedData.songHistory = [];
    }
    
    return parsedData;
  }
  return { songHistory: [] };
}

// Song history management functions
function addSongToHistory(artist, title) {
  const currentData = loadCurrentData();
  const newSong = {
    artist: artist,
    title: title,
    timestamp: new Date().toISOString()
  };
  
  // Check if this is the same as the current song (avoid duplicates)
  const lastSong = getCurrentSong(currentData);
  if (lastSong && lastSong.artist === artist && lastSong.title === title) {
    return currentData; // No change needed
  }
  
  // Add new song to the end of the array
  currentData.songHistory.push(newSong);
  
  // Keep only the last 3 songs
  if (currentData.songHistory.length > 3) {
    currentData.songHistory = currentData.songHistory.slice(-3);
  }
  
  return currentData;
}

function getCurrentSong(data = null) {
  const currentData = data || loadCurrentData();
  const history = currentData.songHistory || [];
  return history.length > 0 ? history[history.length - 1] : null;
}

function getPreviousSong(data = null) {
  const currentData = data || loadCurrentData();
  const history = currentData.songHistory || [];
  return history.length > 1 ? history[history.length - 2] : null;
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

app.get("/swagger.json", swaggerBasicAuth, (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

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

  // Build response with current and previous song data for backward compatibility
  const currentSong = getCurrentSong(currentData);
  const previousSong = getPreviousSong(currentData);

  const response = { ...currentData };

  // Add current song fields for backward compatibility
  if (currentSong) {
    response.artist = currentSong.artist;
    response.title = currentSong.title;
  }

  // Add previous song fields
  if (previousSong) {
    response.previousArtist = previousSong.artist;
    response.previousTitle = previousSong.title;
  }

  res.json(response);
});

app.get("/current/artist", (req, res) => {
  const currentData = loadCurrentData();
  const currentSong = getCurrentSong(currentData);

  if (!currentSong || !currentSong.artist) {
    return res.status(404).json({ error: "No current artist found" });
  }

  res.json({ artist: currentSong.artist });
});

app.get("/current/title", (req, res) => {
  const currentData = loadCurrentData();
  const currentSong = getCurrentSong(currentData);

  if (!currentSong || !currentSong.title) {
    return res.status(404).json({ error: "No current title found" });
  }

  res.json({ title: currentSong.title });
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
  
  let currentData = loadCurrentData();
  
  // Handle song updates with history
  if (filtered.artist && filtered.title) {
    currentData = addSongToHistory(filtered.artist, filtered.title);
    delete filtered.artist; // Remove from filtered since it's now in songHistory
    delete filtered.title;
  }
  
  // Update other fields (microphone, automation, eof)
  const updatedData = { ...currentData, ...filtered };
  
  fs.writeFile(DATA_FILE, JSON.stringify(updatedData), (err) => {
    if (err) {
      console.error("Error writing to data file:", err);
    }
  });

  // TODO: Validate the request body structure and content, Check types, etc.
  
  // Emit current and previous song data from history
  const currentSong = getCurrentSong(updatedData);
  const previousSong = getPreviousSong(updatedData);
  
  if (currentSong) {
    socket.emit("artist", currentSong.artist);
    socket.emit("title", currentSong.title);
  }
  
  if (previousSong) {
    socket.emit("previousArtist", previousSong.artist);
    socket.emit("previousTitle", previousSong.title);
  } else {
    // Clear previous song if none exists
    socket.emit("previousArtist", "");
    socket.emit("previousTitle", "");
  }
  
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
