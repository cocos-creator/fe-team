const { ipcRenderer } = require('electron');

global.hostAPI = {
    sendToHost: (channel, ...args) => ipcRenderer.sendToHost(channel, args),
    ipcRenderer,
};
