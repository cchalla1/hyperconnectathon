const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
const server = http.createServer(app);
// const io = require('socket.io')(server);
const cors = require('cors');
app.use(cors({ origin: '*' }));
// Settings for CORS
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.header('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', false);

    // Pass to next layer of middleware
    next();
});

var io = require('socket.io').listen(server, {
  log: false,
  agent: false,
  origins: '*:*',
  transports: ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling']
});
// io.configure(function () { 
//   io.set("transports", ["xhr-polling"]); 
//   io.set("polling duration", 10); 
// });
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});
setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
const port = 8000

app.use(bodyParser.json());
app.get('/', (req, res) => res.send('Hello World!'))
app.post('/stream', function(req, res) {
  io.emit('data', req.body);
  console.log(req.body);
  res.status(200).json(req.body);
});

app.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`))
