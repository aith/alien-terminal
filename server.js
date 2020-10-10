const express = require("express");
const app = express();
const socket = require("socket.io");

//local server setup
const server = app.listen(3000, () => {
  console.log("connected to server");
});

//serve static files
app.use(express.static(__dirname + "/public"));

const io = socket(server);
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  // Enable "chat" socket
  socket.on("chat", function (data) {
    // Emit on "chat" event
    io.sockets.emit("chat", data);
  });

  // This event invokes Listeners from all devices except this one
  socket.broadcast.emit("requestMessages");

  socket.on("giveMessages", function (data) {
    io.sockets.emit("giveMessages", data);
  });

  // socket.on("syncText", function (data) {
  //   io.sockets.emit("syncText", data);
  // });
});
