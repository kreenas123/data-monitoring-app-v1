const { app, BrowserWindow ,ipcMain } = require("electron");
// const { spawn } = require("child_process");
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname,'criton.png')
  });

  mainWindow.loadURL(`${app.getAppPath()}\\client\\build\\index.html`);

  mainWindow.setMenu(null);

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
  ipcMain.on('request-data', async (event, startDate, endDate, startTime, endTime) => {
    try {
      const filePath = path.join(__dirname, 'server','demo.csv');
      const fileData = fs.readFileSync(filePath, 'utf8');
      parse(fileData, { columns: true }, (err, data) => {
        if (err) {
          console.error('Error while parsing CSV:', err);
          event.reply('response-data', 'Error parsing CSV');
        } else {
          const currentDate = new Date();
          const defaultStartDate =
            startDate || currentDate.toISOString().split("T")[0];
          const defaultEndDate = endDate || currentDate.toISOString().split("T")[0];
          const defaultStartTime = startTime || "00:00:00";
          const defaultEndTime = endTime || "23:00:00";
    
          // console.log(
          //   defaultStartDate,
          //   defaultEndDate,
          //   defaultStartTime,
          //   defaultEndTime,
          //   "default filters"
          // );
    
          const startYear = defaultStartDate.split("-")[0];
          const startMonth = defaultStartDate.split("-")[1];
          const endYear = defaultEndDate.split("-")[0];
          const endMonth = defaultEndDate.split("-")[1];
    
          // console.log(startYear, endYear, startMonth, endMonth)
    
          const filteredAccToYearMonth = data.filter((item) => {
            const timestamp = new Date(item.Timestamp);
            const itemYear = timestamp.getFullYear();
            const itemMonth = (timestamp.getMonth() + 1).toString().padStart(2, '0');
    
            return (
              itemYear >= startYear &&
              itemYear <= endYear &&
              itemMonth >= startMonth &&
              itemMonth <= endMonth
            );
          });
          // console.log(filteredAccToYearMonth.length)
    
          const startDateTime = `${defaultStartDate}T${defaultStartTime}.000Z`;
          const endDateTime = `${defaultEndDate}T${defaultEndTime}.000Z`;
          // console.log(startDateTime, endDateTime);
    
          const filteredData = filteredAccToYearMonth.filter((item) => {
            const timestamp = item.Timestamp
            return timestamp >= startDateTime && timestamp <= endDateTime;
          });
  
          event.reply('response-data', filteredData);
        }
      });
    } catch (error) {
      console.error('Error while fetching data:', error);
      // Send an error message back to the renderer process if needed
      event.reply('response-data', 'Error fetching data');
    }
  });
});

// Quit the app when all windows are closed (except on macOS)
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

// On macOS, set the application icon in the dock
app.on('ready', () => {
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, 'icons', 'app_icon.png'));
  }
});