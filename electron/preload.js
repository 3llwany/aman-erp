const { contextBridge } = require('electron');

// Keep the exposed surface intentionally empty during Phase 2.
// Database and file operations will be added as narrowly scoped IPC methods
// after authorization checks are implemented in the main process.
contextBridge.exposeInMainWorld('amanDesktop', Object.freeze({
  platform: process.platform,
  version: process.versions.electron
}));
