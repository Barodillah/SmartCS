const fs = require('fs');
let c = fs.readFileSync('c:/laragon/www/SmartCS/src/pages/panel/ChurnPrediction.jsx', 'utf8');
c = c.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('c:/laragon/www/SmartCS/src/pages/panel/ChurnPrediction.jsx', c);
