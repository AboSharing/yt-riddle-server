// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');
const PORT = process.env.PORT || 8080;

// Leaderboard speichern
let leaderboard = {};
let activePlayers = {}; // socket.id => {name, isAdmin}

app.use(express.static('public'));

// Lobby-Events
io.on('connection', socket => {
    console.log('Neuer Spieler verbunden');

    socket.on('join', ({ nickname, password }) => {
        // Admin-Check
        let isAdmin = false;
        if(nickname === 'Google') {
            if(password !== '123') {
                socket.emit('nickname-error', 'Falsches Admin-Passwort!');
                return;
            } else {
                isAdmin = true;
            }
        }

        // Prüfen, ob der Name schon vergeben ist
        if(Object.values(activePlayers).some(p => p.name === nickname)) {
            socket.emit('nickname-error', 'Nickname bereits vergeben!');
            return;
        }

        activePlayers[socket.id] = { name: nickname, isAdmin };
        console.log(`${nickname} ist jetzt aktiv${isAdmin ? ' (Admin)' : ''}`);

        // Lobby aktualisieren
        updateLobby();
    });

    socket.on('chat-message', msg => {
        const player = activePlayers[socket.id];
        if(player) {
            io.emit('chat-message', { name: player.name, message: msg, isAdmin: player.isAdmin });
        }
    });

    socket.on('disconnect', () => {
        delete activePlayers[socket.id];
        updateLobby();
    });
});

function updateLobby() {
    const displayNames = Object.values(activePlayers).map(p => p.isAdmin ? `<span class="admin">${p.name} (Admin)</span>` : p.name);
    io.emit('lobby-update', { count: Object.keys(activePlayers).length, displayNames });
}

http.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
