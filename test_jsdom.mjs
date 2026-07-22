import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('dist/index.html', 'utf8');

const dom = new JSDOM(html, {
  url: "http://localhost:3000/",
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true
});

dom.window.console.error = (...args) => {
  console.log("BROWSER ERROR:", ...args);
};

dom.window.console.log = (...args) => {
  console.log("BROWSER LOG:", ...args);
};

// We also need to map the scripts since they are local files
dom.window.addEventListener('error', (event) => {
  console.log("UNHANDLED BROWSER ERROR:", event.error);
});

setTimeout(() => {
  console.log("Done waiting");
  process.exit(0);
}, 3000);
