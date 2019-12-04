const request = require("request");
const http = require('http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
var cors = require('cors');

app.use(cors());

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
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      const result = {event: req.body.SKU_ID, data: req.body};
      console.log(result, JSON.stringify(result));
      client.send(JSON.stringify(result));
    }
  });
  res.status(200).json(req.body);
})

app.get("/getAddtoCartDetails/:id", (req, res) => {
  let skuId = req.params.id;
  let username = 'abhishek.a.karmakar@oracle.com';
  let pass = 'Oracle@123';
  let auth = 'Basic ' + new Buffer(username + ":" + pass).toString("base64");
  let options = {
    method: 'GET',
    url: 'https://api.oracleinfinity.io/v1/account/hsj8iasxuf/dataexport/wudw40rzgk/data',  
    qs: {
      begin: '2019/11/27/00',
      end: 'latest',
      format: 'json',
      timezone: 'Asia/Calcutta'
    },
    headers: { Authorization: auth } 
  };
  
  let endResult = {quantity: 0};
  request(options, function (error, response) {
    if (error) throw new Error(error);
    let result = JSON.parse(response.body);
    result.dimensions.forEach(dimension => {
      if (dimension.value == skuId) {
        dimension.measures.forEach(measure => {
          if (measure.guid == "Cart Adds") {
            endResult.quantity = measure.value;
          }
        })
      }
    })
    res.status(200).json(endResult);
  });
})

server.listen(process.env.PORT || 8000, function() { });
