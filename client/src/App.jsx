import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false); // Track if the current user is the host
  const [isCreatingGame, setIsCreatingGame] = useState(false); // Track if the user wants to create a game
  const [gameId, setGameId] = useState(''); // Track the game ID

  // Initialize socket connection
  useEffect(() => {
    const socket = socketIOClient('http://localhost:3000');
    setSocket(socket);

    // Add event listeners for socket events
    socket.on('player-joined', (newPlayer) => {
      // Handle when a new player joins
      setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
    });

    // Handle when the server designates the current player as the host
    socket.on('you-are-the-host', () => {
      setIsHost(true);
    });

    // Handle when the game is created and a game ID is provided
    socket.on('game-created', (createdGameId) => {
      setGameId(createdGameId);
      setIsCreatingGame(false); // Stop showing game creation elements
    });

    // Handle when the game is not found (invalid game ID)
    socket.on('game-not-found', () => {
      alert('Game not found. Please check the game ID.');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Event handler for starting the game
  const startGame = () => {
    if (isHost) {
      // Only the host can start the game
      socket.emit('start-game');
    }
  };

  // Event handler for creating a game
  const createGame = () => {
    setIsCreatingGame(true);
    socket.emit('create-game', playerName); // Inform the server to create a game
  };

  // Event handler for joining a game with a game ID
  const joinGame = () => {
    socket.emit('join-game', gameId, playerName); // Inform the server that the player is joining with their name and game ID
  };

  return (
    <div>
      {isCreatingGame ? (
        <div>
          {/* Render game creation elements here */}
        </div>
      ) : (
        <div>
          {isHost ? (
            <div>
              <button onClick={startGame}>Start Game</button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Your Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Game ID"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
              />
            </div>
          )}
          <button onClick={joinGame}>Join Game</button>
          <button onClick={createGame}>Create Game</button>
        </div>
      )}

      <div>
        <h2>Players:</h2>
        <ul>
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
