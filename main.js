const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

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
  const serverProcess = spawn("node", [path.join(__dirname,"server", "server.js")]);

  serverProcess.stdout.on("data", (data) => {
    console.log(`Server output: ${data}`);
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`Server error: ${data}`);
  });

  mainWindow.on("closed", () => {
    // Terminate the Node.js server process when the main window is closed
    serverProcess.kill();
    mainWindow = null;
  });
}

app.on("ready", createWindow);

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
