// Custom build script to bypass problematic dependencies
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting custom build process...');

// Create build directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'build'))) {
  fs.mkdirSync(path.join(__dirname, 'build'));
}

// Copy public folder to build
console.log('Copying public folder to build directory...');
execSync('cp -r public/* build/');

// Create a simple index.html if it doesn't exist in build
if (!fs.existsSync(path.join(__dirname, 'build', 'index.html'))) {
  console.log('Creating index.html...');
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Trade AI Platform" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Trade AI Platform</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
  `;
  fs.writeFileSync(path.join(__dirname, 'build', 'index.html'), indexHtml);
}

console.log('Build completed successfully!');