const fs = require('fs');
const content = fs.readFileSync('d:/Backend/express.js/chapter6/krushi-seva-kendra/krushi-sava-kendra/frontend/src/sales/SaleEntry.jsx', 'utf8');
const lines = content.split(/\r?\n/);
lines.forEach((line, idx) => {
  if (line.includes('addChild') || line.includes('setChildren')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
