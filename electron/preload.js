const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('amanDesktop', Object.freeze({
  platform: process.platform,
  version: process.versions.electron,
  isElectron: true,
  db: {
    getAll: (entityName, query, args) => ipcRenderer.invoke('db:getAll', { entityName, query, args }),
    getById: (entityName, id) => ipcRenderer.invoke('db:getById', { entityName, id }),
    create: (entityName, data) => ipcRenderer.invoke('db:create', { entityName, data }),
    update: (entityName, id, data) => ipcRenderer.invoke('db:update', { entityName, id, data }),
    delete: (entityName, id) => ipcRenderer.invoke('db:delete', { entityName, id }),
    bulkInsert: (entityName, items) => ipcRenderer.invoke('db:bulkInsert', { entityName, items }),
    getStats: () => ipcRenderer.invoke('db:getStats'),
    backupLegacy: (data) => ipcRenderer.invoke('db:backupLegacy', data)
  }
}));
