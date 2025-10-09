const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    // Development: load dari Vite dev server (jika sudah running)
    console.log("🔧 Development mode - loading from localhost:5173");
    win.loadURL("http://localhost:5173");
  } else {
    // Production: load dari backend server yang running di localhost:5000
    console.log("📦 Production mode - loading from localhost:5000");
    win.loadURL("http://localhost:5000");
  }
  
  // win.webContents.openDevTools(); // Hapus/komentari agar DevTools tidak otomatis terbuka
}

app.whenReady().then(() => {
  app.commandLine.appendSwitch("disable-site-isolation-trials");
  
  console.log("🚀 Starting Electron app...");
  console.log("NODE_ENV:", process.env.NODE_ENV || "production");
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

