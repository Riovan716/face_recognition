import db from "./config/Database.js";
import "./models/UserModel.js";
import "./models/MahasiswaModel.js";
import "./models/DosenModel.js";
import "./models/MataKuliahModel.js";
import "./models/KelasModel.js"; // pastikan ini sesuai

(async () => {
  try {
    await db.sync({ alter: true });
    console.log("Database synced successfully.");
    process.exit();
  } catch (err) {
    console.error("Error syncing database:", err);
    process.exit(1);
  }
})();
