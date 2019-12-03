const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(app);
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
