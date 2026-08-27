const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../../assets');
const dest = path.resolve(__dirname, '../assets');

if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
}