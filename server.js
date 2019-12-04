var WebSocketServer = require('websocket').server;
var http = require('http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const server = http.createServer(app);

// create the server
const WebSocket = require('ws');
 
const wss = new WebSocket.Server({ server });
let clients = new Map();
 
wss.on('connection', function connection(ws, req, client) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  const ip = req.connection.remoteAddress;
  console.log(req.connection, ip);
  clients.set(ip, client);
});

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send("Hellow World");
});

app.post("/stream", (req, res) => {
  for (const client in clients) {
    clients.forEach(client => {
      console.log(Object.keys(client), client._events);
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(req.body));
      }
    });
  }
  res.status(200).json(req.body);
})

app.post("/stream/addToCart", (req, res) => {
  for (const client in clients) {
    clients.forEach(client => {
      console.log(Object.keys(client), client._events);
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(req.body));
      }
    });
  }
  res.status(200).json(req.body);
})

server.listen(process.env.PORT || 8000, function() { });
