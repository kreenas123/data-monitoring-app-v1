const express = require("express");
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require("cors");
const dataController = require("./controllers/dataController");

app.use(express.static("public"));
app.use(cors());
app.use(express.json()); 

app.get("/api/data", dataController.getData);

app.get("/", (req, res) => {
  res.json("Yay!");
});

// Define the API endpoint
app.post("/api", (req, res) => {
  console.log("first")
  const formData = req.body;
  console.log(req.body);

  const config = formData;

  // Specify the file path for the JSON file
  const filePath = path.join(__dirname, '../client/src/config.json');

  // Write the config to the JSON file
  fs.writeFile(filePath, JSON.stringify(config), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error writing to JSON config file' });
    }

    // Return a success response
    return res.json({ message: 'Config file created successfully' });
  });
});

const port = 8080
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  // dataController.generateAndAppendData();
});
