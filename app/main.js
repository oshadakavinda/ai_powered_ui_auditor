const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 900,
    minHeight: 700,
    backgroundColor: '#f8f9ff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV !== 'production') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  ipcMain.handle('get-sources', async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] });
    return sources.map(s => ({ id: s.id, name: s.name, thumbnail: s.thumbnail.toDataURL() }));
  });

  ipcMain.handle('get-app-info', () => ({
    version: app.getVersion(),
    name: app.getName(),
    platform: process.platform,
  }));

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
    win = null;
  }
});
