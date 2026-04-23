import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const srcDir = path.join(process.cwd(), 'src');
const domainDir = path.join(srcDir, 'domain');
const sharedDir = path.join(srcDir, 'shared');

walk(srcDir, (filePath) => {
  if (!filePath.endsWith('.ts')) return;

  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Replace ../domain/ and ../shared/ with actual relative paths
  newContent = newContent.replace(/from\s+['"]\.\.\/domain\/(.*?)['"]/g, (match, p1) => {
    let relative = path.relative(path.dirname(filePath), domainDir);
    if (!relative.startsWith('.')) relative = './' + relative;
    return `from '${relative}/${p1}'`;
  });

  newContent = newContent.replace(/from\s+['"]\.\.\/shared\/(.*?)['"]/g, (match, p1) => {
    let relative = path.relative(path.dirname(filePath), sharedDir);
    if (!relative.startsWith('.')) relative = './' + relative;
    return `from '${relative}/${p1}'`;
  });

  if (content !== newContent) {
    console.log(`Updated ${filePath}`);
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
});
