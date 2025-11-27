require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const RotaGame = require('./utils/rotaLogic');

const app = express();
const server = http.createServer(app);

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://game-dashboard-three-omega.vercel.app" // Placeholder for future Vercel URL
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      // For dev/deploy transition, we allow it, but in strict prod you might block
      return callback(null, true); 
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Same logic for Socket.IO
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Game State Management (In-memory for now)
const games = {}; // roomId -> gameInstance
const queue = []; // Waiting players [socketId]

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  // --- Rota Multiplayer Logic ---

  socket.on("join_rota_queue", (user) => {
    // If user is already in a game, ignore
    for (const roomId in games) {
        if (games[roomId].players[socket.id]) return;
    }

    console.log(`User ${user.username} (${socket.id}) joined Rota queue`);
    
    if (queue.length > 0) {
        const opponent = queue.shift();
        
        // Prevent playing against self
        if (opponent.socketId === socket.id) {
            queue.push(opponent);
            return;
        }

        const roomId = `rota_${opponent.socketId}_${socket.id}`;
        const game = new RotaGame(opponent.socketId, socket.id);
        games[roomId] = game;

        // Join both to room
        socket.join(roomId);
        io.sockets.sockets.get(opponent.socketId)?.join(roomId);

        // Notify start
        io.to(roomId).emit("game_start", { 
            roomId, 
            players: { [opponent.socketId]: opponent.username, [socket.id]: user.username },
            gameState: game.getState()
        });

        console.log(`Game started: ${roomId}`);
    } else {
        queue.push({ socketId: socket.id, username: user.username });
    }
  });

  socket.on("create_private_room", (user) => {
      const roomId = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
      
      // Create a placeholder game/room entry
      // We can reuse the 'games' object but we need to know it's waiting for a second player
      // Let's store waiting private rooms separately or use a flag
      games[roomId] = {
          players: { [socket.id]: user.username },
          isPrivate: true,
          creatorId: socket.id
      };
      
      socket.join(roomId);
      socket.emit("room_created", { roomId });
      console.log(`Private room created: ${roomId} by ${user.username}`);
  });

  socket.on("join_private_room", ({ roomId, user }) => {
      const room = games[roomId];
      
      if (!room || !room.isPrivate) {
          socket.emit("join_error", "Room not found or invalid");
          return;
      }

      if (Object.keys(room.players).length >= 2) {
          socket.emit("join_error", "Room is full");
          return;
      }

      const creatorId = room.creatorId;
      
      // Initialize actual game logic now that we have 2 players
      const game = new RotaGame(creatorId, socket.id);
      games[roomId] = game; // Replace placeholder with actual game instance

      socket.join(roomId);
      
      // Notify start
      io.to(roomId).emit("game_start", { 
          roomId, 
          players: { [creatorId]: room.players[creatorId], [socket.id]: user.username },
          gameState: game.getState()
      });
      
      console.log(`Private game started: ${roomId}`);
  });

  socket.on("rota_move", ({ roomId, move }) => {
      const game = games[roomId];
      if (!game) return;

      const result = game.makeMove(socket.id, move);
      
      if (result.error) {
          socket.emit("move_error", result.error);
      } else {
          io.to(roomId).emit("game_update", game.getState());
          
          if (game.winner) {
              // TODO: Save to DB
              io.to(roomId).emit("game_over", { winner: game.winner });
              delete games[roomId];
          }
      }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    
    // Remove from queue
    const queueIndex = queue.findIndex(p => p.socketId === socket.id);
    if (queueIndex !== -1) queue.splice(queueIndex, 1);

    // Handle active games (Auto-forfeit)
    for (const roomId in games) {
        if (games[roomId].players[socket.id]) {
            io.to(roomId).emit("opponent_disconnected");
            delete games[roomId];
        }
    }
  });
});

// Database Connection
const PORT = process.env.PORT || 5000;

console.log("--- DEBUGGING DB CONNECTION ---");
console.log("URI exists?", !!process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully to Cloud Atlas");
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });
