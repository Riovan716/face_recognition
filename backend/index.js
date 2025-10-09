import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/Database.js";
import SequelizeStore from "connect-session-sequelize";
import UserRoute from "./routes/UserRoute.js";
import ProductRoute from "./routes/ProductRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import RequestAkun from "./models/RequestAkunModel.js";
import RequestAkunRoute from "./routes/RequestAkunRoute.js";
import mahasiswaRoute from "./routes/MahasiswaRoute.js";
import dosenRoute from "./routes/DosenRoute.js";
import MataKuliahRoute from "./routes/MataKuliahRoute.js";
import KelasRoute from "./routes/KelasRoute.js";
import EnrollmentRoute from "./routes/EnrollmentRoute.js";
import UploadWajahRoute from "./routes/UploadWajahRoute.js";
import { checkEnrollment } from "./controllers/Enrollment.js";
import PresensiRoute from "./routes/PresensiRoute.js";
import StatistikRoute from "./routes/StatistikRoute.js";
import PresensiGlobalRoute from "./routes/PresensiGlobalRoute.js";
import UnknownFaceRoute from "./routes/UnknownFaceRoute.js";
import "./models/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
  db: db,
});

(async () => {
  await db.sync();
})();

console.log('CWD:', process.cwd());

app.use(
  cors({
    credentials: true,
    origin: process.env.NODE_ENV === 'production' 
      ? ["http://localhost:5000", "file://*", "https://*"] 
      : [/^file:\/\/.*/, "http://localhost:5173"],
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESS_SECRET || process.env.SESSION_SECRET || "your-super-secret-key-change-this",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: false,
      sameSite: "lax",
    },
  })
);

// Serve static files for frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Serve static files for face dataset
app.use(
  '/mahasiswa/face_recognition/dataset',
  express.static(path.join(process.cwd(), 'face_recognition/dataset'))
);

// API Routes (tanpa prefix /api)
app.use(UserRoute);
app.use(ProductRoute);
app.use(AuthRoute);
app.use(RequestAkunRoute);
app.use(mahasiswaRoute);
app.use(dosenRoute);
app.use(MataKuliahRoute);
app.use(KelasRoute);
app.use(EnrollmentRoute);
app.use(UploadWajahRoute);
app.use(PresensiRoute);
app.use(StatistikRoute);
app.use(PresensiGlobalRoute);
app.use(UnknownFaceRoute);

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.APP_PORT || process.env.SERVER_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server up and running on port ${PORT}...`);
  console.log(`Frontend will be served from: ${path.join(__dirname, '../frontend/dist')}`);
});
