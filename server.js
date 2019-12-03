const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);
io.on('connection', socket => {
  console.log("user connected");
});
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))
app.post('/stream', function(req, res) {
  io.emit('data', req.body);
  res.status(204);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))