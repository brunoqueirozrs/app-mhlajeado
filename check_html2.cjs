const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const rootContent = await page.innerHTML('#root');
  console.log("ROOT HTML LENGTH:", rootContent.length);
  if (rootContent.length < 500) {
    console.log("ROOT HTML IS SMALL! Something crashed.");
    console.log(rootContent);
  } else {
    console.log("App rendered successfully.");
  }
  await browser.close();
})();
