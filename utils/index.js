const path = require('path');
const fs = require('fs');


function  readFile(file) {
  return fs.readFileSync(file);
}
module.exports.readFile = readFile;
