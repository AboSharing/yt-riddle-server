const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 8080;
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

// Statische Dateien ausliefern
app.use(express.static(path.join(__dirname, 'public')));

// Leaderboard laden oder erstellen
let leaderboard = {};
if(fs.existsSync(LEADERBOARD_FILE)){
  leaderboard = JSON.parse(fs.readFileSync(LEADERBOARD_FILE));
}

// Socket.io Verbindung
io.on('connection', socket => {
  console.log('Neuer Spieler verbunden');

  // Spieler betritt das Spiel
  socket.on('join', nickname => {
    // Nickname prüfen, Dopplungen verhindern
    let original = nickname;
    let i = 1;
    while(leaderboard[nickname]) {
      nickname = `${original}${i}`;
      i++;
    }
    if(!leaderboard[nickname]) {
      leaderboard[nickname] = {score: 0, lastUpdate: new Date()};
    }
    socket.nickname = nickname;
    saveLeaderboard();
    io.emit('leaderboard', leaderboard);
  });

  // Punkte erhalten
  socket.on('score', ({nickname, points}) => {
    if(leaderboard[nickname]){
      leaderboard[nickname].score += points;
      leaderboard[nickname].lastUpdate = new Date();
      saveLeaderboard();
      io.emit('leaderboard', leaderboard);
    }
  });

  socket.on('disconnect', () => {
    console.log('Spieler getrennt');
  });
});

// Leaderboard speichern
function saveLeaderboard() {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2));
}

// Server starten
server.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
