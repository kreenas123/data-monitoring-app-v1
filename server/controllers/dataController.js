const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const crypto = require('crypto');
require('dotenv').config({ path: '../.env'});
// const Chance = require("chance");
// const chance = new Chance();
// let clients = [];

const getData = (req, res) => {
  const {databaseName } = req.query;
  // console.log(databaseName)
  const filePath = `${databaseName}.csv`;
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", () => {
      const { startDate, endDate, startTime, endTime } = req.query;
      // console.log(startDate, endDate, startTime, endTime,"applied filters");

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

      const filteredAccToYearMonth = results.filter((item) => {
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

      res.json(filteredData);
    })
    .on("error", (error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
};

const decryptConfig = (req,res)=>{
  const encryptionKey = 'mnbvcxzasdqwertyuiop0987654321kk';
  // const encryptionKey = process.env.KEY;

// Read the encrypted file data
// C:\Users\P-1\Desktop\data-monitoring-app\encrypted-config.json
const filePath = path.join(__dirname, '..',  '..', 'encrypted-config.json');
const encryptedFileData = fs.readFileSync(filePath, 'utf-8');
const { iv, encryptedData } = JSON.parse(encryptedFileData);

// Convert the initialization vector (iv) to a Buffer
const ivBuffer = Buffer.from(iv, 'hex');

// Create a decipher instance with the same key and iv
const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), ivBuffer);

// Decrypt the data
let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');
decryptedData += decipher.final('utf-8');

// Parse the decrypted JSON data
const decryptedConfig = JSON.parse(decryptedData);

// console.log('Decrypted Configuration:', decryptedConfig);
// res.json(decryptedConfig);
res.json(JSON.parse(decryptedConfig));

}

// function sendRealtimeData(data) {
//   clients.forEach((client) => {
//     client.send(JSON.stringify(data));
//   });
// }

// const generateRandomData = () => {
//   const timestamp = Date.now();
//   const date = new Date(timestamp).toISOString().split("T")[0];
//   const month = new Date(timestamp).toLocaleString("default", {
//     month: "long",
//   });
//   const time = new Date(timestamp).toLocaleTimeString();
//   const temperature = chance.integer({ min: 20, max: 400 });
//   const humidity = chance.integer({ min: 30, max: 700 });
//   const pressure = chance.integer({ min: 800, max: 1200 });

//   return {
//     timestamp,
//     date,
//     month,
//     time,
//     pressure,
//     temperature,
//     humidity,
//   };
// };

// Realtime data generation code 
// function generateAndAppendData() {
//   const data = generateRandomData();

//   // Check if the file already exists
//   const fileExists = fs.existsSync(filePath);

//   // Append the data to the file
//   fs.appendFile(
//     filePath,
//     `${
//       fileExists
//         ? ""
//         : "Timestamp,Date,Month,Time,Pressure,Temperature,Humidity\n"
//     }${data.timestamp},${data.date},${data.month},${data.time},${
//       data.pressure
//     },${data.temperature},${data.humidity}\n`,
//     (error) => {
//       if (error) {
//         console.error("Error appending data:", error);
//       }
//     }
//   );

//   sendRealtimeData(data);

//   setTimeout(generateAndAppendData, 1); // Generate data every 1 second
// }

module.exports = {
  // sendRealtimeData,
  decryptConfig,
  getData,
  // generateAndAppendData
};
