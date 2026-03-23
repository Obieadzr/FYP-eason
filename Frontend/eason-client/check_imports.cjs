const fs = require('fs');
const path = require('path');
function walk(dir, fn) {
  fs.readdirSync(dir).forEach(f => {
    let d = path.join(dir, f);
    if (fs.statSync(d).isDirectory()) walk(d, fn);
    else if (d.endsWith('.jsx') || d.endsWith('.js')) fn(d);
  });
}
const errors = [];
walk('./src', (f) => {
  let content = fs.readFileSync(f, 'utf8');
  let lines = content.split('\n');
  lines.forEach((l, i) => {
    let m = l.match(/import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/);
    if (!m) return;
    let p = m[1];
    if (p.startsWith('.')) {
      let resolved = path.resolve(path.dirname(f), p);
      if (!fs.existsSync(resolved) && !fs.existsSync(resolved + '.js') && !fs.existsSync(resolved + '.jsx') && !fs.existsSync(resolved + '/index.js') && !fs.existsSync(resolved + '/index.jsx')) {
         errors.push(`${f}:${i+1} -> missing ${p}`);
      }
    }
  });
});
fs.writeFileSync('broken_imports.txt', errors.join('\n'));
