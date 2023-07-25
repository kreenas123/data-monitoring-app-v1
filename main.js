const { app, BrowserWindow ,ipcMain} = require("electron");
// const { spawn } = require("child_process");
const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(`${app.getAppPath()}\\client\\build\\index.html`);

  // Start the Node.js server as a child process
  // const serverProcess = spawn("node", [path.join(__dirname,"server", "server.js")]);

  // serverProcess.stdout.on("data", (data) => {
  //   console.log(`Server output: ${data}`);
  // });

  // serverProcess.stderr.on("data", (data) => {
  //   console.error(`Server error: ${data}`);
  // });

  mainWindow.on("closed", () => {
    // Terminate the Node.js server process when the main window is closed
    // serverProcess.kill();
    mainWindow = null;
  });
}

app.on("ready", () => {
  createWindow();

  // IPC event handler for 'request-data' message from the renderer process
  ipcMain.on('request-data', async (event) => {
    try {
      // Fetch data from the backend or perform any other logic you need
      const responseData = 'Data from backenddddddddddddddddddddd yarrrrrrrrrrrrrrrrrrrrr';

      // Send the data back to the renderer process
      event.reply('response-data', responseData);
    } catch (error) {
      console.error('Error while fetching data:', error);
      // Send an error message back to the renderer process if needed
      event.reply('response-data', 'Error fetching data');
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
