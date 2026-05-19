const fs = require('fs');
const path = require('path');

const walkDir = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
        results = results.concat(walkDir(file));
      }
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
};

const files = walkDir('d:/Backend/express.js/chapter6/krushi-seva-kendra');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('conversionFactor') || content.includes('conversion_factor')) {
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (line.includes('stockIncrement') || line.includes('stock_increment') || line.includes('stockDecrement')) {
        console.log(`${path.basename(file)}:${idx + 1}: ${line.trim()}`);
      }
    });
  }
});
