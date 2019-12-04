var http = require('http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const server = http.createServer(app);

// create the server
const WebSocket = require('ws');
 
const wss = new WebSocket.Server({ server });
 
wss.on('connection', function connection(ws, req, client) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
});

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send("Hellow World");
});

app.post("/stream", (req, res) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(req.body));
    }
  });
  res.status(200).json(req.body);
})

app.post("/stream/addToCart", (req, res) => {
 console.log(req.body);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(req.body));
    }
  });
  res.status(200).json(req.body);
})

server.listen(process.env.PORT || 8000, function() { });
