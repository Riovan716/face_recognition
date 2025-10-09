const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// ✅ Caching folder /models selama 30 hari
app.use(
  "/models",
  express.static(path.join(__dirname, "public", "models"), {
    maxAge: "30d",
    etag: false,
  })
);

// 🧩 Sisa file (React build) disajikan juga jika perlu
app.use(express.static(path.join(__dirname, "dist"))); // ganti dengan 'build' kalau pakai CRA

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
});
