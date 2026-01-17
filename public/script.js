const socket = io();
const joinBtn = document.getElementById('joinBtn');
const nicknameInput = document.getElementById('nickname');
const leaderboardDiv = document.getElementById('leaderboard');
const activeDiv = document.getElementById('active-players');

let nickname = '';

joinBtn.addEventListener('click', () => {
    if(!nicknameInput.value) return alert("Bitte Nickname eingeben!");
    nickname = nicknameInput.value;
    socket.emit('join', nickname);
});

socket.on('nickname-error', msg => {
    alert(msg);
});

// Lobby-Update
socket.on('lobby-update', data => {
    const { count, displayNames } = data;
    activeDiv.innerHTML = `<h3>Spieler online: ${count}</h3>`;
    displayNames.forEach(name => {
        activeDiv.innerHTML += `<div>${name}</div>`;
    });
});

// Leaderboard aktualisieren
socket.on('leaderboard', data => {
  leaderboardDiv.innerHTML = '';
  const sorted = Object.entries(data).sort((a,b) => b[1].totalScore - a[1].totalScore);
  sorted.slice(0,10).forEach(([name, info], i) => {
    const div = document.createElement('div');
    div.textContent = `${i+1}. ${name}: ${info.totalScore} Punkte`;
    leaderboardDiv.appendChild(div);
  });
});
