const { app, dialog } = require("electron");
const ModbusRTU = require("modbus-serial");
const csv = require("fast-csv");
const fs = require("fs");
const path = require("path");
const config = require("./config_modbusSerial.json")
// const config = require("C:\\Users\\P-1\\Desktop\\data-monitoring-app\\config_modbusSerial.json")
let columnHeaders;

// test code start
// function readCoilStatus(startAddress, count) {
//   console.log(`Reading Coil Status: Start Address ${startAddress}, Count ${count}`);
// }
// function readInputStatus(startAddress, count) {
//   console.log(`Reading Input Status: Start Address ${startAddress}, Count ${count}`);
// }
// function readHoldingRegister(startAddress, count) {
//   console.log(`Reading Holding Register: Start Address ${startAddress}, Count ${count}`);
// }
// function readInputRegister(startAddress, count) {
//   console.log(`Reading Input Register: Start Address ${startAddress}, Count ${count}`);
// }

// function testModbusData(slave) {
//   for (const objectType in slave.object_type) {
//     const objectTypeInfo = slave.object_type[objectType];

//     if (objectTypeInfo.status === 'yes') {
//       switch (objectType) {
//         case 'Coil Status':
//           readCoilStatus(parseInt(objectTypeInfo.startAddress), parseInt(objectTypeInfo.count));
//           break;

//         case 'Input Status':
//           readInputStatus(parseInt(objectTypeInfo.startAddress), parseInt(objectTypeInfo.count));
//           break;

//         case 'Holding Register':
//           readHoldingRegister(parseInt(objectTypeInfo.startAddress), parseInt(objectTypeInfo.count));
//           break;

//         case 'Input Register':
//           readInputRegister(parseInt(objectTypeInfo.startAddress), parseInt(objectTypeInfo.count));
//           break;

//         default:
//           console.error('Unsupported object type:', objectType);
//       }
//     }
//   }
// }

// for (const slaveId in config.slaves) {
//   // console.log(slaveId);
//   const slave = config.slaves[slaveId];
//   testModbusData(slave);
// }
// test code end

// Modbus RTU configuration
const modbusConfig = {
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: "none"
};

const modbusRTUClient = new ModbusRTU();
let dataFolderPath = null

function DialougeMessage(message) {
  dialog.showMessageBox({
    type: "info",
    title: "PopUp",
    message: "message",
    detail: message,
    buttons: ["OK"],
  });
}

function createDataFolder(installDir) {
  const dataFolderPath = path.join(installDir, "data");
  DialougeMessage("Data folder directory " + dataFolderPath);

  try {
    // Create the "data" folder if it doesn't exist
    if (!fs.existsSync(dataFolderPath)) {
      console.log("Creating data folder in " + dataFolderPath)
      DialougeMessage("Creating data folder in " + dataFolderPath);
      fs.mkdirSync(dataFolderPath);
    }
  } catch (err) {
    DialougeMessage('Error creating "data" folder:', err.message);
    console.error('Error creating "data" folder:', err.message);
    return null;
  }

  return dataFolderPath;
}

// Function to initialize the Modbus connection
function initializeModbusConnection() {
  modbusRTUClient.connectRTUBuffered(
    "COM8",
    {
      baudRate: modbusConfig.baudRate,
      dataBits: modbusConfig.dataBits,
      stopBits: modbusConfig.stopBits,
      parity: modbusConfig.parity,
    },
    (err) => {
      if (err) {
        DialougeMessage("Error establishing Modbus connection : " + err.message);
        console.error("Error opening Modbus connection:", err.message);
        // process.exit(1); // Terminate the application on connection error
      } else {
        DialougeMessage("Connection Established");
        console.log("Modbus connection opened.");
        for (const slaveId in config.slaves) {
          const slave = config.slaves[slaveId];
          readModbusData(slave); // Read data immediately after the connection is established
        }
      }
    }
  );
}

function generateColumnHeaders(data) {
  const numColumns = data.length;
  columnHeaders = ['Timestamp'];

  for (let i = 1; i <= numColumns; i++) {
    columnHeaders.push(`Data${i}`);
  }

  return columnHeaders;
}

function generateCSV(data,slaveName , object_type) {
  const timestamp = new Date().toISOString();
  const dataWithTimestamp = [timestamp, ...data];

  // Get the installation directory
  let installDir = path.dirname(app.getPath("exe"));

  if (dataFolderPath === null) {
    if (installDir.includes("Program Files")) {
      installDir = path.dirname(app.getPath("userData"));
      dataFolderPath = createDataFolder(installDir);
    } else {
      installDir = path.dirname(app.getPath("exe"));
      dataFolderPath = createDataFolder(installDir);
    }
    return;
  }

  // Define the path where the csv file should be created
  const csvFilePath = path.join(dataFolderPath, `${slaveName}_${object_type}.csv`);

  // Check if the CSV file exists
  const fileExists = fs.existsSync(csvFilePath);

  const ws = fs.createWriteStream(csvFilePath, { flags: "a" });

  // Create a CSV stream
  const csvStream = csv.format({ headers: true, includeEndRowDelimiter: true });

  columnHeaders = generateColumnHeaders(data);

  // If the file doesn't exist, add the headers to the CSV stream
  if (!fileExists) {
    // csvStream.write(['Timestamp','Data1','Data2','Data3','Data4','Data5','Data6','Data7','Data8','Data9','Data10']);
    csvStream.write(columnHeaders);
  }

  csvStream.pipe(ws);

  // Write the data with timestamp to the CSV stream
  csvStream.write(dataWithTimestamp);

  // End the CSV stream
  csvStream.end();
}

// Function to read data from the Modbus slave
function readModbusData(slave) {
  modbusRTUClient.setID(parseInt(slave.slave_id));

  for (const objectType in slave.object_type) {
    const objectTypeInfo = slave.object_type[objectType];

    if (objectTypeInfo.status === 'yes') {
      switch (objectType) {
        case 'Coil Status':
          modbusRTUClient.readCoilStatus(
            parseInt(objectTypeInfo.startAddress),
            parseInt(objectTypeInfo.count),
            (err, data) => {
              if (!err) {
                console.log("Coil Status data reading from Modbus slave:", data.data);
                generateCSV(data.data,slave.slave_name,objectType);

              } else {
                console.error('Error reading Coil Status data:', err.message);
              }
            }
          );
          break;

        case 'Input Status':
          modbusRTUClient.readInputStatus(
            parseInt(objectTypeInfo.startAddress), parseInt(objectTypeInfo.count),
            (err, data) => {
              if (!err) {
                console.log("Input Status data reading from Modbus slave:", data.data);
                generateCSV(data.data,slave.slave_name,objectType);
              } else {
                console.error('Error reading Input Status data:', err.message);
              }
            }
          );

          break;

        case 'Holding Register':
          modbusRTUClient.readHoldingRegisters(
            parseInt(objectTypeInfo.startAddress), parseInt(objectTypeInfo.count),
            (err, data) => {
              if (!err) {
                console.log("Holding Register data reading from Modbus slave:", data.data);
                generateCSV(data.data,slave.slave_name,objectType);
              } else {
                console.error("Error reading Holding Register data:", err.message);
              }
            }
          );
          break;

        case 'Input Register':
          modbusRTUClient.readInputRegisters(
            parseInt(objectTypeInfo.startAddress),
            parseInt(objectTypeInfo.count),
            (err, data) => {
              if (!err) {
                console.log("Input Register data reading from Modbus slave:", data.data);
                generateCSV(data.data,slave.slave_name,objectType);
              } else {
                console.error('Error reading Input Register data:', err.message);
              }
            }
          );
          break;

        default:
          console.error('Unsupported object type:', objectType);
      }
    }
  }
}

// Function to start periodic data fetch
function startDataFetching(intervalSeconds) {
  return setInterval(() => {
    for (const slaveId in config.slaves) {
      const slave = config.slaves[slaveId];
      readModbusData(slave);
    }
  }, intervalSeconds * 1000);
}

// Function to stop periodic data fetch
function stopDataFetching(dataInterval) {
  clearInterval(dataInterval);
  modbusRTUClient.close(() => {
    DialougeMessage("Serial port closed");
  });
}

module.exports = {
  initializeModbusConnection,
  startDataFetching,
  stopDataFetching,
};