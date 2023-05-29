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

// Data structure to store room names and associated users
const rooms = new Map();

const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Running');
});

function findRoomBySocketId(socketId) {
  for (const [roomId, room] of rooms.entries()) {
    const socket = room.users.find((socket) => socket.id === socketId);
    if (socket) {
      return roomId;
    }
  }
  return null;
}

// io.on("connection", (socket) => {
//   socket.emit("me", socket.id);
//   console.log('user just connected with id :' + socket.id);

//   socket.on("disconnect", () => {
//     const roomId = findRoomBySocketId(socket.id);
//     if (roomId) {
//       const room = rooms.get(roomId);
//       room.use = room.users.filter(socket => socket.id !== socketId);
//       if (room.users.length === 0) {
//         rooms.delete(roomId);
//       } else {
//         rooms.set(roomId, room);
//       }
//       io.to(roomId).emit("user left", socket.id);
//     }
//     console.log(`User ${socket.id} disconnected.`);
//   });

//   socket.on('checkRoom', () => {
//     const roomId = findRoomBySocketId(socket.id);
//     const isInRoom = roomId !== null;
//     socket.emit('roomCheckResult', { isInRoom, roomId });
//   });

//   socket.on("joinRoom", ({ roomId, name }) => {
//     // Join the specified room
//     socket.join(roomId);

//     // Store the room name and associated users
//     if (!rooms.has(roomId)) {
//       rooms.set(roomId, {
//         name: roomId, // You can replace roomId with a custom name if desired
//         users: [{ id: socket.id, name, stream: { video: true, audio: true } }],
//       });
//     } else {
//       const room = rooms.get(roomId);
//       room.users.push({ id: socket.id, name, stream: { video: true, audio: true } });
//       rooms.set(roomId, room);
//     }

//     // Broadcast the updated room details to all clients in the room
//     io.to(roomId).emit("all users", rooms.get(roomId).users.map(socket => socket.id));

//     console.log(`User ${socket.id} joined room: ${roomId}`);
//   });

  

//   socket.on('returning signal', (payload) => {
//     const { signal, callerID } = payload;
//     io.to(callerID).emit('receiving returned signal', { signal, id: socket.id });
//   });

//   socket.on('send-message', ({ roomId, sender, message, time }) => {
//     console.log({ roomId, sender, message, time });
//     io.to(roomId).emit('receive-message', { sender, message, time }); // Emit the message to all clients in the room
//   });

//   socket.on("callUser", ({ userToCall, signalData, from, name }) => {
//     io.to(userToCall).emit("callUser", { signal: signalData, from, name });
//   });

//   socket.on("answerCall", (data) => {
//     io.to(data.to).emit("callAccepted", data.signal);
//   });
// });

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
    // Store the room name and associated users
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        name: roomId, // You can replace roomId with a custom name if desired
        users: [{ id: socket.id, name, stream: { video: true, audio: true } }],
      });
    } else {
      const room = rooms.get(roomId);
      room.users.push({ id: socket.id, name, stream: { video: true, audio: true } });
      rooms.set(roomId, room);
    }
    console.log(rooms);

    // Broadcast the updated room details to all clients in the room
    io.to(roomId).emit("all users", rooms.get(roomId).users.map(socket => socket));
    // Broadcast the updated room details to all clients in the room
    // io.to(roomId).emit("roomDetails", rooms.get(roomId));

    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('sending signal', (payload) => {
    const { userToSignal, callerID, signalData } = payload;
    io.to(userToSignal).emit('user joined', { signal: signalData, callerID });
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
