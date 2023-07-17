const fs = require('fs');

// Generate a random number between a given range
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate the dataset
function generateDataset() {
  const dataset = [];

  // Start and end timestamps for the dataset
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2023-12-31');

  // Generate data every 5 minutes from start to end
  let currentDate = startDate;
  while (currentDate <= endDate) {
    const timestamp = currentDate.toISOString();

    // Generate random values for each column
    const dataPoint = { timestamp };
    for (let i = 0; i < 10; i++) {
      const columnName = String.fromCharCode(65 + i); // A, B, C, ...
      const minRange = i * 100;
      const maxRange = (i + 1) * 100;
      const value = getRandomNumber(minRange, maxRange);
      dataPoint[columnName] = value;
    }

    dataset.push(dataPoint);

    currentDate.setTime(currentDate.getTime() + 5 * 60 * 1000); // Increment by 5 minutes
  }

  return dataset;
}

// Generate the dataset
const dataset = generateDataset();

// Convert the dataset to CSV format
let csvContent = 'Timestamp,A,B,C,D,E,F,G,H,I,J\n';
dataset.forEach((dataPoint) => {
  csvContent += `${dataPoint.timestamp},${dataPoint.A},${dataPoint.B},${dataPoint.C},${dataPoint.D},${dataPoint.E},${dataPoint.F},${dataPoint.G},${dataPoint.H},${dataPoint.I},${dataPoint.J}\n`;
});

// Save the dataset to a CSV file
fs.writeFile('data.csv', csvContent, (err) => {
  if (err) throw err;
  console.log('Dataset saved to dataset.csv');
});
