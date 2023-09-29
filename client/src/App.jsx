import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false); // Track if the current user is the host

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

  // Event handler for the player joining the game
  const joinGame = () => {
    socket.emit('join-game', playerName); // Inform the server that the player is joining with their name
  };

  return (
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
          <button onClick={joinGame}>Join Game</button>
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
