const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Data structure to store room names and associated IDs
const rooms = new Map();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Running');
});

function findRoomBySocketId(socketId) {
  for (const [roomId, room] of rooms.entries()) {
    const socket = room.ids.find((socket) => socket.id === socketId);
    if (socket) {
      return roomId;
    }
  }
  return null;
}

io.on("connection", (socket) => {
  socket.emit("me", socket.id);
  console.log('user just connected with id :' + socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded")
  });

  socket.on('checkRoom', () => {
    const roomId = findRoomBySocketId(socket.id);
    const isInRoom = roomId !== null;
    socket.emit('roomCheckResult', { isInRoom, roomId });
  });

  socket.on("joinRoom", (data) => {
    const { roomId, name } = data;

    // Join the specified room
    socket.join(roomId);

    // Store the room name and associated IDs
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        name: roomId, // You can replace roomId with a custom name if desired
        ids: [{ id: socket.id, name }],
      });
    } else {
      const room = rooms.get(roomId);
      room.ids.push({ id: socket.id, name });
      rooms.set(roomId, room);
    }

    // Broadcast the updated room details to all clients in the room
    io.to(roomId).emit("roomDetails", rooms.get(roomId));

    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('send-message', ({ roomId, sender, message, time }) => {
    console.log({ roomId, sender, message, time });
    io.to(roomId).emit('receive-message', { sender, message, time }); // Emit the message to all clients in the room
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal)
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
