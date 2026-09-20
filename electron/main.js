const { app, BrowserWindow, Menu, session } = require('electron');
const path = require('node:path');
const { installSecurity } = require('./security');

const APP_NAME = 'AMAN ERP';

function createMainWindow() {
  const win = new BrowserWindow({
    title: APP_NAME,
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    maximized: true,
    autoHideMenuBar: true,
    menuBarVisible: false,
    show: true,
    backgroundColor: '#fbfaf8',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: true
    }
  });

  installSecurity(win);

  // Phase 2 keeps the existing UI intact. The renderer will move to src/index.html
  // after the Realm repository layer and migration are in place.
  const entryFile = path.join(__dirname, '..', 'index.html.html');
  win.loadFile(entryFile).catch((error) => {
    console.error('AMAN ERP renderer load failed:', error);
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent('<h2 style="font-family:Segoe UI;padding:24px">AMAN ERP could not load its interface.</h2>')}`);
  });
  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('AMAN ERP did-fail-load:', errorCode, errorDescription, entryFile);
  });

  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  return win;
}

app.whenReady().then(() => {
  app.setName(APP_NAME);
  Menu.setApplicationMenu(null);
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  const mainWindow = createMainWindow();
  mainWindow.maximize();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
