const fs = require('fs');

const fileToBase64 = (file) => {
     return fs.readFileSync(file, {encoding: 'base64'});
}
module.exports = fileToBase64;