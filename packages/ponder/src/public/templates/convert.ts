const fs = require('fs');
const font = fs.readFileSync('./PaytoneOne-Regular.ttf');
const base64 = font.toString('base64');
fs.writeFileSync('./font.txt', base64, 'utf8');
