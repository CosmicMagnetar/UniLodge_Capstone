import fs from 'fs';
import path from 'path';

function addUseClient(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      addUseClient(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes('"use client"') && !content.includes("'use client'")) {
        content = '"use client";\n' + content;
        fs.writeFileSync(fullPath, content);
      }
      
      // Fix imports for Next.js app directory structure
      // e.g. from '../types' to '@/types'
      content = content.replace(/from\s+['"](?:\.\.\/)+types(?:\.ts)?['"]/g, "from '@/types'");
      content = content.replace(/from\s+['"](?:\.\.\/)+services\//g, "from '@/services/");
      content = content.replace(/from\s+['"](?:\.\.\/)+components\//g, "from '@/components/");
      content = content.replace(/from\s+['"]\.\/types(?:\.ts)?['"]/g, "from '@/types'");
      content = content.replace(/from\s+['"]\.\/services\//g, "from '@/services/");
      content = content.replace(/from\s+['"]\.\/components\//g, "from '@/components/");
      content = content.replace(/from\s+['"]\.\.\/pages\//g, "from '@/components/layout/"); // For Header

      fs.writeFileSync(fullPath, content);
    }
  }
}

addUseClient('./app');
addUseClient('./components');
addUseClient('./hooks');
addUseClient('./contexts');
