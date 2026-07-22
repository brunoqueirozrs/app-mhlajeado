import { JSDOM } from 'jsdom';
import express from 'express';

const app = express();
app.use(express.static('dist'));

const server = app.listen(3002, () => {
  JSDOM.fromURL("http://localhost:3002/", {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true
  }).then(dom => {
    dom.window.console.error = (...args) => {
      console.log("BROWSER ERROR:", ...args);
    };
    
    dom.window.addEventListener('error', (event) => {
      console.log("UNHANDLED BROWSER ERROR:", event.message, event.error);
    });

    setTimeout(() => {
      console.log("DOM content:", dom.window.document.body.innerHTML.substring(0, 200));
      process.exit(0);
    }, 4000);
  });
});
