const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var path = require('path');
require('dotenv').config()

const appkey = process.env.APPKEY;
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/post', (req, res) => {
    var socket = io;

    if(req.query.key != appkey){
        return res.sendStatus(400);
    }

    if(req.query.artist) socket.emit('artist', req.query.artist);

    if (req.query.title) socket.emit('title', req.query.title);

    if (req.query.microphone) socket.emit('microphone', req.query.microphone);
    
    if (req.query.automation) socket.emit('automation', req.query.automation);
  
    if (req.query.eof) socket.emit('eof', req.query.eof);

    res.sendStatus(200);
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});