/*const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  createWindow();
});
*/

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,        // ⚠️ must be false for contextBridge
      contextIsolation: true,        // ⚠️ must be true for contextBridge
      preload: path.join(__dirname, "preload.js"), // ✅ preload file
    },
  });

  win.loadURL('http://localhost:3000');

  // ✅ Listen for print-bill event
  ipcMain.on('print-bill', () => {
    if (win) {
      // Print only the current window content (can be styled for bill)
      win.webContents.print(
        { silent: false, printBackground: true },
        (success, failureReason) => {
          if (!success) console.log('Print failed:', failureReason);
          else console.log('Print job sent successfully');
        }
      );
    }
  });
}

app.whenReady().then(createWindow);
