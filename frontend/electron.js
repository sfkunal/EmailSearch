import { app, BrowserWindow, globalShortcut, screen } from 'electron';
import { join } from 'path';
import isDev from 'electron-is-dev';

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${join(__dirname, '../build/index.html')}`
  );
}


let searchWindow = null;

function createSearchWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  searchWindow = new BrowserWindow({
    width: 600,
    height: 60,
    frame: false,
    transparent: true,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  searchWindow.loadFile('search.html');
  searchWindow.setPosition(Math.round(width/2 - 300), Math.round(height/2 - 30));

  searchWindow.on('blur', () => {
    searchWindow.hide();
  });
}

app.whenReady().then(() => {
  createWindow();
  createSearchWindow();

  globalShortcut.register('Command+Shift+Space', () => {
    if (!searchWindow || searchWindow.isDestroyed()) {
      createSearchWindow();
    }
    if (searchWindow.isVisible()) {
      searchWindow.hide();
      // console.log("Search window hidden");
    } else {
      searchWindow.show();
      // console.log("Search window shown");
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});