const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Store game state
let players = [];
let words = [];
let faker = null;
let round = 0;
let host = null; // Track the host player

// Serve static files (if you have a client-side game interface)
app.use(express.static('public'));

// Socket.io logic for game

io.on('connection', (socket) => {
  // Handle player joining
  socket.on('join-game', (playerName) => {
    // Add the player to the game
    players.push({ id: socket.id, name: playerName });

    // If no host is set, make the current player the host
    if (!host) {
      host = socket.id;
      socket.emit('you-are-the-host');
    }

    // Send game information to the player
    socket.emit('game-info', {
      players,
      words,
      round,
      isFaker: faker === socket.id,
    });

    // Broadcast to other players that a new player has joined
    socket.broadcast.emit('player-joined', playerName);
    console.log(playerName + " joined.")
  });

  // Handle game start by the host
  socket.on('start-game', () => {
    if (socket.id === host) {
      // Randomly assign roles and words to players here
      // Set faker and words accordingly
      // Start the first round
      io.emit('game-started', {
        players,
        words,
        round,
        faker,
      });
    }
  });

  // Handle game end
  socket.on('end-game', ({ fakerCaught }) => {
    // Calculate and display final scores here
    // Update the game state for a new round or game
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Remove the player from the game
    players = players.filter((player) => player.id !== socket.id);

    // If the host disconnects, choose a new host
    if (socket.id === host) {
      host = players.length > 0 ? players[0].id : null;
    }

    // Broadcast to other players that a player has left
    socket.broadcast.emit('player-left', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
