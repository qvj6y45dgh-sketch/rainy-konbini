// Bundles src/main.js (+ three.js) into one self-contained index.html
import { build } from 'esbuild';
import fs from 'node:fs';

const r = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', target: 'es2020', write: false });
const js = r.outputFiles[0].text.replace(/<\/script/g, '<\\/script');
const html = fs.readFileSync('src/template.html', 'utf8').replace('/*__BUNDLE__*/', () => js);
fs.writeFileSync('index.html', html);
console.log('index.html', (html.length / 1024).toFixed(0) + ' KB');
