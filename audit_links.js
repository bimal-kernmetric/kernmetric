const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom'); // Wait! JSDOM might not be installed. Let's use simple regex instead to avoid dependency errors.

function getLinks(content) {
  const links = [];
  // Regex to extract href="..." attributes
  const hrefRegex = /href=["']([^"']+)["']/g;
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const url = match[1];
    // Filter out external URLs, hashes, javascript:, mailto:, etc.
    if (!url.startsWith('http') && !url.startsWith('#') && !url.startsWith('javascript:') && !url.startsWith('mailto:')) {
      links.push(url);
    }
  }
  return links;
}

function checkPath(sourceFile, targetRelPath) {
  const sourceDir = path.dirname(sourceFile);
  
  // Strip off query parameters or hashes
  const cleanTarget = targetRelPath.split('?')[0].split('#')[0];
  if (!cleanTarget) return true; // Just a hash or query on same page
  
  const absPath = path.resolve(sourceDir, cleanTarget);
  const exists = fs.existsSync(absPath);
  return { absPath, exists, cleanTarget };
}

const htmlFiles = [
  'index.html',
  ...fs.readdirSync('pages')
    .filter(f => f.endsWith('.html'))
    .map(f => path.join('pages', f))
];

console.log('--- RUNNING KERNMETRIC LINK AUDIT ---');
let brokenCount = 0;

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const links = getLinks(content);
  
  links.forEach(link => {
    const result = checkPath(file, link);
    if (result !== true && !result.exists) {
      console.log(`[BROKEN] inside "${file}": href="${link}" (Resolved to: "${result.absPath}")`);
      brokenCount++;
      
      // Proactive correction rule:
      // If we are in pages/ and link is e.g. "diagnostics.html", wait, we already updated components.js.
      // But what if it's a link to a file inside pages/ from index.html (e.g. href="methodology.html")?
      // Or from a page in pages/ to index.html (e.g. href="index.html" instead of "../index.html")?
      // Let's analyze and fix it!
    }
  });
});

console.log(`Link audit completed. Found ${brokenCount} broken link(s).`);
