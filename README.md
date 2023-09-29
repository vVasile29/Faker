# Faker

## What we are going to build

A android app/website game where everyone but one player (faker) get a word. One person starts calling out a related word, without making it too obvious what the initial word was, while still keeping it related enough to not look like a faker. Other players continue in clockwise direction. The faker tries blending in by figuring out the context. After 3 rounds the players decide on one faker. If the faker is able to name the word or did not get caught he gets a point, otherwise all the other players do.

## Technology

- listen server
- one player is the host (server and client) and generates a link/qr code with which the other players (clients) can join the host's game
- after everyone is in the lobby the host can start a game
- numbers get randomized and the player with number 0 has to start
- numbers get randomized again, the player with the number 0 is the faker
- everybody but the faker gets a word on their screen, faker gets "You're the faker!"
- the host can stop this game and initiate the voting after 3 rounds have passed
- he then can specify if the faker got caught or not, if the faker won he gets a point, otherwise the other players get a point

## How to start

run `npm run dev` in the client directory and `node server.js` in the server directory
