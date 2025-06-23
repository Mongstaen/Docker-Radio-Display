const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var path = require('path');
require('dotenv').config()

const appkey = process.env.APPKEY;
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Add body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

  // The following fields are optional and should be boolean values.
  if ('microphone' in req.body) socket.emit('microphone', Boolean(req.body.microphone));
  if ('automation' in req.body) socket.emit('automation', Boolean(req.body.automation));
  if ('eof' in req.body) socket.emit('eof', Boolean(req.body.eof));

  res.sendStatus(200);
});

server.listen(PORT, () => {
  console.log(`Server Listening on: http://localhost:${PORT}`);
});