var WebSocketServer = require('websocket').server;
var http = require('http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
let webSocket;

var server = http.createServer(app);

// create the server
const WebSocket = require('ws');
 
const wss = new WebSocket.Server({ server });
 
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  webSocket = ws;
 
  ws.send('something');
});

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send("Hellow World");
});

app.post("/stream", function(req, res) {
  webSocket.send(JSON.stringify(req.body));
  res.status(200).json(req.body);
})

server.listen(process.env.PORT || 8000, function() {
  console.log('server started');
});
