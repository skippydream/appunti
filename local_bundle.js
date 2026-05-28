const fs = require('fs');
const path = require('path');

async function bundle() {
  try {
    let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    
    // Inline CSS
    const cssContent = fs.readFileSync(path.join(__dirname, 'css', 'style.css'), 'utf8');
    html = html.replace(/<link\s+rel=["']stylesheet["']\s+href=["']\.\/css\/style\.css["']\s*\/?>/gi, `<style>\n${cssContent}\n</style>`);
    
    // Inline data.js
    const dataContent = fs.readFileSync(path.join(__dirname, 'js', 'data.js'), 'utf8');
    html = html.replace(/<script\s+src=["']\.\/js\/data\.js["']><\/script>/gi, `<script>\n${dataContent}\n</script>`);
    
    // Inline app.js
    const appContent = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');
    html = html.replace(/<script\s+src=["']\.\/js\/app\.js["']><\/script>/gi, `<script>\n${appContent}\n</script>`);
    
    fs.writeFileSync(path.join(__dirname, 'bundle.html'), html, 'utf8');
    console.log('Local bundle.html generated successfully!');
  } catch (err) {
    console.error('Error during bundling:', err);
  }
}

bundle();
