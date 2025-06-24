const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var path = require('path');
require('dotenv').config()

// TODO: Add Swagger documentation and set up correctly
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); // path to swagger.js above


const appkey = process.env.APPKEY || 'yourappkey';
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
// Add body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


// TODO.. Add Swagger documentation for the POST and make it work..
/**
 * @swagger
 * /:
 *   post:
 *     summary: Send data to connected clients
 *     description: Updates artist, title, microphone, automation, and end of file status
 *     security:
 *       - key: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *             properties:
 *               key:
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
app.post('/', (req, res) => {
  var socket = io;
  
  if (!socket) {
    return res.status(500).send('Socket.io not initialized');
  }

  console.log('Received POST request:', req.body);
  if(req.body.key != appkey){
    return res.sendStatus(400);
  }

  // TODO: Validate the request body structure and content, Check types, etc.
  if (req.body.artist) socket.emit('artist', req.body.artist);
  if (req.body.title) socket.emit('title', req.body.title);

  if ('microphone' in req.body) {
    const mic = req.body.microphone;
    if (mic === true || mic === false || mic === 'true' || mic === 'false') {
      const isMicOn = mic === true || mic === 'true';
      socket.emit('microphone', isMicOn);
    } else {
      console.warn('Invalid microphone value:', mic);
      return res.status(400).send('Invalid microphone value. Only true or false is allowed.');
    }
  }

  if ('automation' in req.body) {
    const automation = req.body.automation;
    if (automation === true || automation === false || automation === 'true' || automation === 'false') {
      const isAutoOn = automation === true || automation === 'true';
      socket.emit('automation', isAutoOn);
    } else {
      console.warn('Invalid automation value:', automation);
      return res.status(400).send('Invalid automation value. Only true or false is allowed.');
    }
  }

  if ('eof' in req.body) {
    const endOfFile = req.body.eof;
    if (endOfFile === true || endOfFile === false || endOfFile === 'true' || endOfFile === 'false') {
      const isEndOfFile = endOfFile === true || endOfFile === 'true';
      socket.emit('end of file', isEndOfFile);
    } else {
      console.warn('Invalid eof value:', endOfFile);
      return res.status(400).send('Invalid eof value. Only true or false is allowed.');
    }
  }

  res.sendStatus(200);
});

server.listen(PORT, () => {
  console.log(`Server Listening on: http://localhost:${PORT}`);
});