const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => require('electron').ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => require('electron').ipcRenderer.invoke('check-for-updates')
});
