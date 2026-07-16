// Bulk renaming KernMetrics -> KernMetric
import fs from 'fs';
import path from 'path';

const FILES_TO_UPDATE = [
  'config/config.js',
  'verify.js',
  'package.json',
  'index.html',
  'pages/about.html',
  'pages/admin.html',
  'pages/atlas.html',
  'pages/case-study.html',
  'pages/contact.html',
  'pages/dashboard.html',
  'pages/diagnostics.html',
  'pages/growth-mri.html',
  'pages/knowledge-graph.html',
  'pages/login.html',
  'pages/methodology.html',
  'pages/paradoxes.html',
  'pages/research.html',
  'scripts/case-study.js',
  'scripts/knowledge-graph.js',
  'scripts/research.js'
];

function renameBrand() {
  console.log('--- STARTING BULK BRAND NAME STANDARDIZATION ---');
  
  FILES_TO_UPDATE.forEach(relPath => {
    const absPath = path.resolve(relPath);
    if (!fs.existsSync(absPath)) {
      console.warn(`File not found: ${relPath}`);
      return;
    }
    
    let content = fs.readFileSync(absPath, 'utf8');
    
    // Replace case-sensitive spellings
    const updated = content
      .replace(/KernMetrics/g, 'KernMetric')
      .replace(/KERNMETRICS/g, 'KERNMETRIC');
      
    if (content !== updated) {
      fs.writeFileSync(absPath, updated, 'utf8');
      console.log(`Updated brand name in: ${relPath}`);
    } else {
      console.log(`No changes needed in: ${relPath}`);
    }
  });

  console.log('--- RENAME COMPLETED ---');
}

renameBrand();
