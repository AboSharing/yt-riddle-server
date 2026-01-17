import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing für POST-Requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pfad für Daten speichern
const dataFile = path.join("./data.json");

// Initialisiere Daten, falls noch nicht vorhanden
let data = {
  players: [],
  games: [
    { id: 1, unlocked: true, code: "CODE1" },
    { id: 2, unlocked: false, code: "CODE2" },
    { id: 3, unlocked: false, code: "CODE3" },
    { id: 4, unlocked: false, code: "CODE4" },
    { id: 5, unlocked: false, code: "CODE5" }
  ]
};

// Lade Daten aus Datei
if (fs.existsSync(dataFile)) {
  data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
}

// Funktion zum Speichern der Daten
const saveData = () => {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

// Wöchentliche Freischaltung
const unlockNextGame = () => {
  const lockedGames = data.games.filter(g => !g.unlocked);
  if (lockedGames.length > 0) {
    lockedGames[0].unlocked = true;
    saveData();
  }
};

// Beispiel: Jeden Montag ein Spiel freischalten (hier als Timer alle 60 Sekunden für Test)
setInterval(unlockNextGame, 60 * 1000); // zum Testen, in echt: jede Woche

// Homepage
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>YT Riddle</title>
        <style>
          body { background:#121212; color:white; font-family:sans-serif; }
          input, button { padding:10px; margin:5px; }
          .game { margin:10px 0; padding:10px; border:1px solid #fff; border-radius:10px; }
          .locked { opacity:0.4; }
          .winner { font-weight:bold; color:yellow; }
        </style>
      </head>
      <body>
        <h1>YT Riddle Spiele</h1>

        <form id="playerForm">
          Nickname: <input type="text" id="nickname" required>
          <button type="submit">Eintragen</button>
        </form>

        <h2>Games</h2>
        ${data.games.map(g => `
          <div class="game ${g.unlocked ? "" : "locked"}">
            Spiel ${g.id} - ${g.unlocked ? "Freigeschaltet" : "Gesperrt"}
            ${g.unlocked ? `<button onclick="submitCode(${g.id})">Code eingeben</button>` : ""}
          </div>
        `).join("")}

        <h2>Leaderboard</h2>
        <ul>
          ${data.players.map(p => `
            <li>${p.nickname} - Punkte: ${p.solved || 0}</li>
          `).join("")}
        </ul>

        <button onclick="testButton()">Test Button</button>

        <script>
          const submitCode = (gameId) => {
            const code = prompt("Gib den Code ein:");
            const nickname = document.getElementById("nickname").value;
            fetch("/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nickname, gameId, code })
            }).then(r => r.json())
              .then(res => alert(res.message));
          }

          const testButton = () => {
            fetch("/test")
              .then(r => r.json())
              .then(res => alert(res.message));
          }

          document.getElementById("playerForm").onsubmit = (e) => {
            e.preventDefault();
            alert("Nickname eingetragen: " + document.getElementById("nickname").value);
          }
        </script>
      </body>
    </html>
  `);
});

// Code einreichen
app.post("/submit", (req, res) => {
  const { nickname, gameId, code } = req.body;
  const game = data.games.find(g => g.id == gameId);

  if (!game || !game.unlocked) return res.json({ message: "Spiel gesperrt oder nicht gefunden" });

  let player = data.players.find(p => p.nickname === nickname);
  if (!player) {
    player = { nickname, solved: 0, history: [] };
    data.players.push(player);
  }

  if (code === game.code) {
    player.solved = (player.solved || 0) + 1;
    player.history.push({ gameId, code, time: new Date().toISOString() });
    saveData();
    return res.json({ message: "Richtig! Punkt hinzugefügt." });
  } else {
    return res.json({ message: "Falsch!" });
  }
});

// Test-Button
app.get("/test", (req, res) => {
  res.json({ message: "Test erfolgreich!" });
});

app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
