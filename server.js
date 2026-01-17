// server.js
import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static("public")); // für Frontend-Dateien

// Datenbank-Datei (JSON)
const DATA_FILE = path.join("./data.json");

// Hilfsfunktion, um Daten zu laden
const loadData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    return { players: [], games: [1,2,3,4,5] };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
};

// Hilfsfunktion, um Daten zu speichern
const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Leaderboard abrufen
app.get("/leaderboard", (req, res) => {
  const data = loadData();
  // sortiert nach Gesamtpunktzahl
  const sorted = data.players.sort((a, b) => b.score - a.score);
  res.json(sorted);
});

// Spieler eintragen / Punkte aktualisieren
app.post("/submit", (req, res) => {
  const { nickname, game, points } = req.body;
  const data = loadData();
  const now = new Date();

  let player = data.players.find(p => p.nickname === nickname);
  if (!player) {
    player = { nickname, score: 0, entries: [] };
    data.players.push(player);
  }

  player.score += points;
  player.entries.push({
    game,
    points,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
  });

  saveData(data);
  res.json({ success: true, player });
});

// Testbutton Route
app.get("/test", (req, res) => {
  res.send("Test erfolgreich!");
});

// Minispiele freischalten
app.get("/games", (req, res) => {
  const data = loadData();
  const now = new Date();
  const firstGameDate = new Date("2026-01-17"); // Startdatum
  const unlockedGames = data.games.filter((game, index) => {
    const unlockDate = new Date(firstGameDate);
    unlockDate.setDate(firstGameDate.getDate() + 7 * index);
    return now >= unlockDate;
  });
  res.json({ unlockedGames });
});

// Server starten
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
