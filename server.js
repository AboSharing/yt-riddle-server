import express from "express";
const app = express();
app.use(express.json());
app.use(express.static("public"));

// === Zugangscodes ===
// Mehrere Codes für verschiedene Nutzer
const ACCESS_CODES = ["YT-SECRET-123", "YT-SECRET-456", "YT-SECRET-789"];

// === Daily Hints ===
// Jeder Tag hat einen Hinweis + optional Teil eines Amazon-Codes
const hints = {
  "2026-01-17": { hint: "Schau bei Minute 3:42 👀", codePart: "AB12" },
  "2026-01-18": { hint: "Video X, Sekunde 1:15 🔑", codePart: "CD34" },
  "2026-01-19": { hint: "Minute 2:05, Puzzle lösen 🧩", codePart: "EF56" }
};

// === Login-Endpunkt ===
app.post("/login", (req, res) => {
  const { code } = req.body;
  console.log("Eingegebener Code:", code);
  if (!ACCESS_CODES.includes(code)) return res.status(401).json({ ok: false });
  res.json({ ok: true });
});

// === Daily Hint-Endpunkt ===
app.get("/daily-hint", (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const todayData = hints[today];
  if (!todayData) return res.json({ hint: "Heute noch kein Hinweis." });

  // Hinweis + Code-Fragmente zurückgeben
  res.json({ hint: todayData.hint, codePart: todayData.codePart });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server läuft auf Port", PORT));
