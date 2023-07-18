const fs = require('fs');
const content = JSON.parse(fs.readFileSync("./package.dcp", { encoding: 'utf8'}));

let version = content.version.split('.');
version[2] = +version[2] + 1;
content.version = version.join('.');

fs.writeFileSync("./package.dcp", JSON.stringify(content), {encoding: 'utf8'})