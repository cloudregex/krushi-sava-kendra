const fs = require('fs');
const files = [
  'd:/Backend/express.js/chapter6/krushi-seva-kendra/krushi-sava-kendra/frontend/src/sales/SaleEntry.jsx',
  'd:/Backend/express.js/chapter6/krushi-seva-kendra/krushi-sava-kendra/frontend/src/sales/EditSaleBill.jsx',
  'd:/Backend/express.js/chapter6/krushi-seva-kendra/krushi-sava-kendra/frontend/src/sales/NewQuotation.jsx',
  'd:/Backend/express.js/chapter6/krushi-seva-kendra/krushi-sava-kendra/frontend/src/sales/NewSaleReturn.jsx'
];

files.forEach(file => {
  console.log(`=== FILE: ${file} ===`);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (line.includes('SearchableSelect')) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
});
