import { JSDOM } from 'jsdom';
const dom = new JSDOM(``, {
  url: "http://localhost:3000/",
  runScripts: "dangerously",
  resources: "usable"
});
dom.window.onerror = function(msg, file, line, col, error) {
  console.error("Browser error:", msg, error);
};
setTimeout(() => {
  console.log("Done waiting");
}, 5000);
