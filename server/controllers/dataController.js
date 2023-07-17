const fs = require("fs");
const csv = require("csv-parser");
const Chance = require("chance");
const chance = new Chance();
const filePath = "demo.csv";
// const filePath = "1.csv";
let clients = [];

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

const getData = (req, res) => {
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", () => {
      const { startDate, endDate, startTime, endTime } = req.query;
      // console.log(startDate, endDate, startTime, endTime, "applied filters");

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

      const startDateTime = `${defaultStartDate}T${defaultStartTime}.000Z`;
      const endDateTime = `${defaultEndDate}T${defaultEndTime}.000Z`;
      // console.log(startDateTime, endDateTime);

      const filteredData = results.filter((item) => {
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
  getData,
  // generateAndAppendData
};
