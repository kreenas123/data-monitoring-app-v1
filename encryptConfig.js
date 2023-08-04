const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const encryptionKey = process.env.KEY;
const iv = crypto.randomBytes(16); // Initialization Vector

const rawData = fs.readFileSync('config.json','utf-8');
console.log(rawData)
const data = JSON.stringify(rawData);

const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
let encryptedData = cipher.update(data, 'utf-8', 'hex');
encryptedData += cipher.final('hex');

const encryptedFileData = JSON.stringify({
  iv: iv.toString('hex'),
  encryptedData: encryptedData
});

fs.writeFileSync('encrypted-config.json', encryptedFileData);


