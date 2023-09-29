const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { nanoid } = require('nanoid'); // Import nanoid for generating unique game IDs

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Store game state
let games = {}; // Store games by ID
let players = [];
let words = [];
let faker = null;
let round = 0;

// Serve static files (if you have a client-side game interface)
app.use(express.static('public'));

// Socket.io logic for game

io.on('connection', (socket) => {
  // Handle player joining a game
  socket.on('join-game', (gameId, playerName) => {
    // Check if the game exists
    if (!games[gameId]) {
      socket.emit('game-not-found');
      return;
    }

    // Add the player to the game
    const game = games[gameId];
    game.players.push({ id: socket.id, name: playerName });
    console.log('player ' + playerName + ' joined game ' + gameId);

    // If no host is set, make the current player the host
    if (!game.host) {
      game.host = socket.id;
      socket.emit('you-are-the-host');
      console.log('host set for game ' + gameId + ': ' + game.host);
    }

    // Send game information to the player
    socket.emit('game-info', {
      players: game.players,
      words: game.words,
      round: game.round,
      isFaker: game.faker === socket.id,
    });

    // Broadcast to other players in the same game that a new player has joined
    io.to(gameId).emit('player-joined', playerName);
        console.log(playerName + " joined game " + gameId);
  });

  // Handle creating a new game and getting a game ID
  socket.on('create-game', (playerName) => {
    const gameId = nanoid(6); // Generate a unique game ID
    games[gameId] = {
      players: [{ id: socket.id, name: playerName }],
      words: [], // You can initialize words here
      faker: null,
      round: 0,
      host: socket.id,
    };
    socket.emit('game-created', gameId);
    console.log('Game ' + gameId + ' created by ' + playerName);
    socket.join(gameId); // Join the room with the game ID
  });

  // Handle game start by the host
  socket.on('start-game', () => {
    // Find the game that the host is in
    const gameId = Object.keys(games).find(
      (gameId) => games[gameId].host === socket.id
    );

    if (gameId) {
      const game = games[gameId];
      // Randomly assign roles and words to players here
      // Set faker and words accordingly
      // Start the first round
      io.to(gameId).emit('game-started', {
        players: game.players,
        words: game.words,
        round: game.round,
        faker: game.faker,
      });
      console.log('game ' + gameId + ' started.');
    }
  });

  // Handle game end
  socket.on('end-game', ({ fakerCaught }) => {
    // Calculate and display final scores here
    // Update the game state for a new round or game
    console.log('game ended');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Find the game that the disconnected player is in
    const gameId = Object.keys(games).find(
      (gameId) => games[gameId].players.some((player) => player.id === socket.id)
    );

    if (gameId) {
      const game = games[gameId];
      // Remove the player from the game
      game.players = game.players.filter((player) => player.id !== socket.id);

      // If the host disconnects, choose a new host
      if (socket.id === game.host) {
        game.host = game.players.length > 0 ? game.players[0].id : null;
        console.log('host disconnected for game ' + gameId + ', new host now is: ' + game.host);
      }

      // Broadcast to other players in the same game that a player has left
      socket.to(gameId).broadcast.emit('player-left', socket.id);
      console.log('player ' + socket.id +  ' has left game ' + gameId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
