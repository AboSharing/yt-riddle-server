const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');

app.use(express.static('public'));

const PORT = process.env.PORT || 8080;

// Leaderboard speichern
const leaderboardFile = './data/leaderboard.json';
let leaderboard = {};
if(fs.existsSync(leaderboardFile)) {
    leaderboard = JSON.parse(fs.readFileSync(leaderboardFile));
}

// Spieler in Lobby
let activePlayers = {};

// Admin
const ADMIN_NAME = "Gurkendisco";

// Socket.io Verbindung
io.on('connection', (socket) => {
    console.log('Neuer Spieler verbunden');

    // Spieler beitreten
    socket.on('join', (nickname) => {

        // Nickname prüfen
        if(activePlayers[nickname]) {
            socket.emit('nickname-error', 'Nickname bereits vergeben!');
            return;
        }

        // Spieler hinzufügen
        activePlayers[nickname] = { socketId: socket.id, joinedAt: Date.now() };

        // Admin markieren
        const displayName = (nickname === ADMIN_NAME) 
            ? `<span class="admin">${nickname} (Admin)</span>` 
            : nickname;

        // Lobby-Update senden
        io.emit('lobby-update', { 
            players: Object.keys(activePlayers),
            count: Object.keys(activePlayers).length,
            displayNames: Object.keys(activePlayers).map(name => 
                name === ADMIN_NAME ? `<span class="admin">${name} (Admin)</span>` : name
            )
        });

        // Leaderboard an neuen Spieler senden
        socket.emit('leaderboard', leaderboard);
    });

    // Spieler verlässt Verbindung
    socket.on('disconnect', () => {
        for(const [nick, info] of Object.entries(activePlayers)) {
            if(info.socketId === socket.id) {
                delete activePlayers[nick];
            }
        }
        io.emit('lobby-update', { 
            players: Object.keys(activePlayers),
            count: Object.keys(activePlayers).length,
            displayNames: Object.keys(activePlayers).map(name => 
                name === ADMIN_NAME ? `<span class="admin">${name} (Admin)</span>` : name
            )
        });
    });
});

http.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
