const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});
io.sockets.on('connection', function (socket) {
  io.sockets.emit('status', { status: status }); // note the use of io.sockets to emit but socket.on to listen
  socket.on('reset', function (data) {
    status = "War is imminent!";
    io.sockets.emit('status', { status: status });
  });
});
const port = 8000

app.use(bodyParser.json());
app.get('/', (req, res) => res.send('Hello World!'))
app.post('/stream', function(req, res) {
  io.emit('data', req.body);
  console.log(req.body);
  res.status(200).json(req.body);
});

app.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`))
