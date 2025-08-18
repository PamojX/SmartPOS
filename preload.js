const { contextBridge, ipcRenderer } = require("electron");

// Expose safe ipcRenderer methods to the renderer
contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel, data) => {
      ipcRenderer.send(channel, data);
    }
  }
});
