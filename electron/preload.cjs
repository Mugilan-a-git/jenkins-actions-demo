const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => require('electron').ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => require('electron').ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => require('electron').ipcRenderer.invoke('download-update'),
  installUpdate: () => require('electron').ipcRenderer.invoke('install-update'),
  onUpdateProgress: (callback) => require('electron').ipcRenderer.on('update-progress', (event, value) => callback(value)),
  onUpdateDownloaded: (callback) => require('electron').ipcRenderer.on('update-downloaded', (event, value) => callback(value))
});
