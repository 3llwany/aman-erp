const { app, BrowserWindow, Menu, session, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { installSecurity } = require('./security');
const { dbService } = require('../services/db.service');
const { getDataDirectory } = require('../database/realm');

const APP_NAME = 'AMAN ERP';

function registerIpcHandlers() {
  ipcMain.handle('db:getAll', async (_event, { entityName, query, args }) => {
    return dbService.getAll(entityName, query, args);
  });

  ipcMain.handle('db:getById', async (_event, { entityName, id }) => {
    return dbService.getById(entityName, id);
  });

  ipcMain.handle('db:create', async (_event, { entityName, data }) => {
    return dbService.create(entityName, data);
  });

  ipcMain.handle('db:update', async (_event, { entityName, id, data }) => {
    return dbService.update(entityName, id, data);
  });

  ipcMain.handle('db:delete', async (_event, { entityName, id }) => {
    return dbService.delete(entityName, id);
  });

  ipcMain.handle('db:bulkInsert', async (_event, { entityName, items }) => {
    return dbService.bulkInsert(entityName, items);
  });

  ipcMain.handle('db:getStats', async () => {
    return dbService.getStats();
  });

  ipcMain.handle('db:backupLegacy', async (_event, data) => {
    try {
      const backupDir = path.join(getDataDirectory(), '..', 'backup');
      fs.mkdirSync(backupDir, { recursive: true });
      const filename = `localStorage-backup-${Date.now()}.json`;
      const backupPath = path.join(backupDir, filename);
      fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf8');
      return { success: true, path: backupPath };
    } catch (err) {
      console.error('Backup legacy failed:', err);
      return { success: false, error: err.message };
    }
  });
}

function createMainWindow() {
  const win = new BrowserWindow({
    title: APP_NAME,
    icon: path.join(__dirname, '..', 'assets', 'aman-erp.ico'),
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
      sandbox: false,
      webSecurity: true,
      spellcheck: true
    }
  });

  installSecurity(win);

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
  
  registerIpcHandlers();
  
  const mainWindow = createMainWindow();
  mainWindow.maximize();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
