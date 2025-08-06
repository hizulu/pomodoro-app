const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    icon: path.join(__dirname, 'assets', 'pomodoroIcon.png'),
    maximizable: false,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.removeMenu(); // Elimina el menú
  mainWindow.setMenuBarVisibility(false); // Oculta el menú incluso en macOS

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

ipcMain.on('notify', (event, { title, body }) => {
  new Notification({ title, body }).show();
});

// Listener para restaurar/focus
ipcMain.on('focus-window', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// Squirrel installer shortcut removal (Windows)
if (require('electron-squirrel-startup')) {
  app.quit();
}

app.whenReady().then(() => {
  app.setName('Pomodoro App');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
