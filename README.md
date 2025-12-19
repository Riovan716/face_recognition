# Face Recognition Attendance System

Sistem presensi berbasis face recognition untuk aplikasi desktop menggunakan Electron.

## Prerequisites

- Node.js (v16 atau lebih tinggi)
- MySQL Database
- npm atau yarn

## Instalasi

### 1. Clone atau download project

```bash
cd presensi_app3
```

### 2. Install dependencies

Install dependencies untuk root, backend, dan frontend:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Setup Database

1. Buat database MySQL dengan nama `presensi_app` (atau sesuai konfigurasi)
2. Copy file `backend/env.example` menjadi `backend/.env`
3. Edit file `backend/.env` dan sesuaikan konfigurasi database:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=presensi_app
DB_PORT=3306

APP_PORT=5000
SERVER_PORT=5000

SESS_SECRET=your-super-secret-key-change-this
SESSION_SECRET=your-super-secret-key-change-this

NODE_ENV=development
```

### 4. Setup Database Models

Database akan otomatis di-sync saat backend pertama kali dijalankan. Atau jalankan:

```bash
cd backend
node sync.js
```

## Menjalankan Project

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

Backend akan berjalan di `http://localhost:5000`

**Terminal 2 - Frontend (opsional untuk development):**
```bash
cd frontend
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

**Terminal 3 - Electron App:**
```bash
npm run dev
```

### Production Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Build Frontend (jika belum):**
```bash
npm run build:frontend
```

**Terminal 3 - Electron App:**
```bash
npm run prod
```

## Build untuk Distribusi

### Build Windows Executable

```bash
npm run build:win
```

File installer akan tersimpan di folder `dist/`

## Scripts yang Tersedia

- `npm start` - Menjalankan Electron app (production mode)
- `npm run dev` - Menjalankan Electron app (development mode)
- `npm run prod` - Menjalankan Electron app (production mode)
- `npm run build:frontend` - Build frontend untuk production
- `npm run build:win` - Build Windows installer
- `npm run start:backend` - Menjalankan backend server
- `npm run start:frontend` - Menjalankan frontend dev server

## Struktur Project

```
presensi_app3/
├── backend/          # Backend API (Express + Sequelize)
├── frontend/         # Frontend React App (Vite)
├── electron/         # Electron main process
└── dist/            # Build output
```

## Catatan

- Pastikan MySQL sudah berjalan sebelum menjalankan backend
- Pastikan backend sudah berjalan sebelum menjalankan Electron app
- Untuk development, Electron akan load dari `http://localhost:5173` (jika frontend dev server running)
- Untuk production, Electron akan load dari `http://localhost:5000` (backend server)

